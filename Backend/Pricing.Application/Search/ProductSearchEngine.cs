#nullable enable
using Mercado.Craibas.Application.DTOs.Requests;
using Mercado.Craibas.Application.DTOs.Responses;

namespace Mercado.Craibas.Application.Search;

public sealed class QueryToken
{
    public string Raw { get; init; } = string.Empty;
    public string Canonical { get; init; } = string.Empty;
    public bool IsNumber { get; init; }
    public List<string> Corrections { get; init; } = new();
    public string? BestCorrection { get; init; }
    public HashSet<string> Synonyms { get; init; } = new(StringComparer.Ordinal);
}

public sealed class ParsedQuery
{
    public string Original { get; init; } = string.Empty;
    public List<QueryToken> Tokens { get; init; } = new();
    public bool AccessoryIntent { get; init; }
    public bool IsEmpty => Tokens.Count == 0;
}

public sealed record RankedProduct(ProductSearchDocument Document, double Score);

public sealed class RankedResult
{
    public ParsedQuery Query { get; init; } = new();
    public List<RankedProduct> Items { get; init; } = new();
    public bool IsPartialMatch { get; init; }
    public string? CorrectedQuery { get; init; }
}

public static class ProductSearchEngine
{
    public const string SortRelevance = "relevancia";
    public const string SortPriceAsc = "menor-preco";
    public const string SortPriceDesc = "maior-preco";
    public const string SortReviews = "avaliacao";
    public const string SortBestSellers = "mais-vendidos";

    public static ParsedQuery Parse(string? query, ProductSearchIndex index, ProductSearchOptions options)
    {
        var text = (query ?? string.Empty).Trim();
        if (text.Length > options.MaxQueryLength)
            text = text[..options.MaxQueryLength];

        var pairs = SearchText.TokenizePairs(text);
        if (pairs.Count == 0)
            pairs = SearchText.TokenizePairs(text, removeStopWords: false);

        var seen = new HashSet<string>(StringComparer.Ordinal);
        var synonyms = BuildSynonyms(options);
        var accessoryWords = ProductSearchIndexBuilder.Canonicalize(options.AccessoryWords);
        var tokens = new List<QueryToken>();

        foreach (var (raw, canonical) in pairs)
        {
            if (!seen.Add(canonical))
                continue;
            if (tokens.Count >= options.MaxQueryTokens)
                break;

            if (SearchText.IsNumber(canonical))
            {
                tokens.Add(new QueryToken { Raw = raw, Canonical = canonical, IsNumber = true });
                continue;
            }

            var corrections = new List<string>();
            string? best = null;

        
            if (!index.Postings.ContainsKey(canonical) && !HasPrefixInVocabulary(canonical, index, options))
                (corrections, best) = FindCorrections(canonical, index, options);

            var tokenSynonyms = new HashSet<string>(StringComparer.Ordinal);
            foreach (var term in corrections.Prepend(canonical))
                if (synonyms.TryGetValue(term, out var list))
                    tokenSynonyms.UnionWith(list);
            tokenSynonyms.Remove(canonical);

            tokens.Add(new QueryToken
            {
                Raw = raw,
                Canonical = canonical,
                Corrections = corrections,
                BestCorrection = best,
                Synonyms = tokenSynonyms
            });
        }

        var accessoryIntent = tokens.Any(t =>
            accessoryWords.Contains(t.Canonical) || t.Corrections.Any(accessoryWords.Contains));

        return new ParsedQuery { Original = text, Tokens = tokens, AccessoryIntent = accessoryIntent };
    }

    private static bool HasPrefixInVocabulary(string token, ProductSearchIndex index, ProductSearchOptions options)
        => token.Length >= options.PrefixMinLength
           && index.Vocabulary.Keys.Any(k => k.Length > token.Length && k.StartsWith(token, StringComparison.Ordinal));

    private static (List<string> corrections, string? best) FindCorrections(
        string token, ProductSearchIndex index, ProductSearchOptions options)
    {
        if (token.Length < options.FuzzyMinLength)
            return (new List<string>(), null);

        var maxEdits = token.Length >= 8 ? options.FuzzyMaxEditsLong : options.FuzzyMaxEditsShort;
        var found = new List<(string term, int distance, int frequency)>();

        foreach (var (term, frequency) in index.Vocabulary)
        {
            // Mesma primeira letra e só palavras: evita trocar "17" por "16" ou "bola" por "cola".
            if (term.Length < options.FuzzyMinLength || term[0] != token[0] || SearchText.IsNumber(term))
                continue;

            var distance = SearchText.EditDistance(token, term, maxEdits);
            if (distance <= maxEdits)
                found.Add((term, distance, frequency));
        }

        if (found.Count == 0)
            return (new List<string>(), null);

        var minDistance = found.Min(f => f.distance);
        var closest = found
            .Where(f => f.distance == minDistance)
            .OrderByDescending(f => f.frequency)
            .ThenBy(f => f.term, StringComparer.Ordinal)
            .ToList();

        return (closest.Select(f => f.term).ToList(), closest[0].term);
    }

    private static Dictionary<string, HashSet<string>> BuildSynonyms(ProductSearchOptions options)
    {
        var result = new Dictionary<string, HashSet<string>>(StringComparer.Ordinal);
        foreach (var (key, values) in options.Synonyms)
        {
            var keyTokens = SearchText.Tokenize(key, removeStopWords: false);
            if (keyTokens.Count != 1)
                continue;

            if (!result.TryGetValue(keyTokens[0], out var set))
                result[keyTokens[0]] = set = new HashSet<string>(StringComparer.Ordinal);

            foreach (var value in values)
            {
                var valueTokens = SearchText.Tokenize(value, removeStopWords: false);
                if (valueTokens.Count == 1)
                    set.Add(valueTokens[0]);
            }
        }
        return result;
    }

    // ═════════════════════════ Ranking ═════════════════════════

    public static RankedResult Rank(string? query, ProductSearchIndex index, ProductSearchOptions options)
    {
        var parsed = Parse(query, index, options);
        if (parsed.IsEmpty || index.Documents.Count == 0)
            return new RankedResult { Query = parsed };

        var candidates = CollectCandidates(parsed, index, options);

        var complete = new List<RankedProduct>();
        var partial = new List<RankedProduct>();
        var usedCorrection = false;
        var totalTokens = parsed.Tokens.Count;

        foreach (var position in candidates)
        {
            var doc = index.Documents[position];
            if (HasModelConflict(doc, parsed))
                continue;

            double score = 0;
            var matched = 0;
            var numbersMissing = false;
            var strongHit = false;
            var docUsedCorrection = false;

            foreach (var token in parsed.Tokens)
            {
                var (tokenScore, viaCorrection) = MatchToken(doc, token, options);
                if (tokenScore > 0)
                {
                    matched++;
                    score += tokenScore;
                    if (tokenScore >= options.Synonym) strongHit = true;
                    if (viaCorrection) docUsedCorrection = true;
                }
                else if (token.IsNumber)
                {
                    numbersMissing = true;
                }
            }

            if (matched == 0)
                continue;

            score += Bonuses(doc, parsed, options, matched == totalTokens);

            if (doc.IsAccessory)
                score += parsed.AccessoryIntent ? options.AccessoryBoost : -options.AccessoryPenalty;

            if (doc.TotalStock <= 0)
                score -= options.OutOfStockPenalty;

            if (matched == totalTokens)
            {
                complete.Add(new RankedProduct(doc, score));
                usedCorrection |= docUsedCorrection;
            }
            else if (!numbersMissing && strongHit && totalTokens >= 2
                     && (double)matched / totalTokens >= options.PartialMinCoverage)
            {
                partial.Add(new RankedProduct(doc, score));
            }
        }

        var isPartial = complete.Count == 0 && partial.Count > 0;
        var items = isPartial ? partial : complete;
        if (isPartial)
            usedCorrection = parsed.Tokens.Any(t => t.Corrections.Count > 0);

        items.Sort(CompareByRelevance);

        return new RankedResult
        {
            Query = parsed,
            Items = items,
            IsPartialMatch = isPartial,
            CorrectedQuery = usedCorrection && items.Count > 0 ? BuildCorrectedQuery(parsed, index) : null
        };
    }

    private static int CompareByRelevance(RankedProduct a, RankedProduct b)
    {
        var byScore = b.Score.CompareTo(a.Score);
        if (byScore != 0) return byScore;
        var bySold = b.Document.CountSold.CompareTo(a.Document.CountSold);
        if (bySold != 0) return bySold;
        return a.Document.Id.CompareTo(b.Document.Id);
    }

    /// <summary>Junta só os produtos que têm alguma das palavras (índice invertido), em vez de olhar o catálogo todo.</summary>
    private static SortedSet<int> CollectCandidates(ParsedQuery parsed, ProductSearchIndex index, ProductSearchOptions options)
    {
        var result = new SortedSet<int>();

        void Add(string term)
        {
            if (index.Postings.TryGetValue(term, out var list))
                result.UnionWith(list);
        }

        foreach (var token in parsed.Tokens)
        {
            Add(token.Canonical);
            if (token.IsNumber)
                continue;

            foreach (var s in token.Synonyms) Add(s);
            foreach (var c in token.Corrections) Add(c);

            if (token.Canonical.Length >= options.PrefixMinLength)
                foreach (var term in index.Vocabulary.Keys)
                    if (term.Length > token.Canonical.Length && term.StartsWith(token.Canonical, StringComparison.Ordinal))
                        Add(term);
        }

        return result;
    }

    /// <summary>
    /// Número de modelo: se o nome do produto tem números e o número digitado não aparece
    /// no nome, tags, variantes nem descrição, é outro modelo ("iphone 17" nunca traz "iPhone 16").
    /// </summary>
    private static bool HasModelConflict(ProductSearchDocument doc, ParsedQuery parsed)
    {
        foreach (var token in parsed.Tokens)
        {
            if (!token.IsNumber || doc.NameNumbers.Count == 0)
                continue;

            if (!doc.NameNumbers.Contains(token.Canonical)
                && !doc.OtherNumbers.Contains(token.Canonical)
                && !doc.DescriptionSet.Contains(token.Canonical))
                return true;
        }
        return false;
    }

    /// <summary>Melhor acerto de uma palavra num produto. Devolve também se veio de correção de digitação.</summary>
    private static (double score, bool viaCorrection) MatchToken(ProductSearchDocument doc, QueryToken token, ProductSearchOptions options)
    {
        var t = token.Canonical;
        double best = 0;

        if (doc.NameSet.Contains(t)) best = Math.Max(best, options.NameExact);
        if (doc.TagSet.Contains(t)) best = Math.Max(best, options.TagExact);
        if (doc.CategorySet.Contains(t)) best = Math.Max(best, options.CategoryExact);
        if (doc.VariantSet.Contains(t)) best = Math.Max(best, options.VariantExact);
        if (doc.DescriptionSet.Contains(t)) best = Math.Max(best, options.DescriptionExact);

        if (token.IsNumber)
            return (best, false);

        if (t.Length >= options.PrefixMinLength)
        {
            if (best < options.NamePrefix && doc.NameSet.Any(n => n.Length > t.Length && n.StartsWith(t, StringComparison.Ordinal)))
                best = options.NamePrefix;
            if (best < options.OtherPrefix
                && (doc.TagSet.Any(n => n.Length > t.Length && n.StartsWith(t, StringComparison.Ordinal))
                    || doc.CategorySet.Any(n => n.Length > t.Length && n.StartsWith(t, StringComparison.Ordinal))))
                best = options.OtherPrefix;
        }

        if (best < options.Synonym && token.Synonyms.Any(s => doc.NameSet.Contains(s) || doc.TagSet.Contains(s) || doc.CategorySet.Contains(s)))
            best = options.Synonym;

        var viaCorrection = false;
        if (token.Corrections.Count > 0)
        {
            double fuzzy = 0;
            if (token.Corrections.Any(doc.NameSet.Contains)) fuzzy = options.FuzzyName;
            else if (token.Corrections.Any(c => doc.TagSet.Contains(c) || doc.CategorySet.Contains(c))) fuzzy = options.FuzzyOther;

            if (fuzzy > best)
            {
                best = fuzzy;
                viaCorrection = true;
            }
        }

        return (best, viaCorrection);
    }

    private static double Bonuses(ProductSearchDocument doc, ParsedQuery parsed, ProductSearchOptions options, bool allMatched)
    {
        double bonus = 0;
        if (allMatched) bonus += options.AllTokensBonus;

        var effective = parsed.Tokens.Select(t => EffectiveTerm(doc, t)).ToList();
        var name = doc.NameTokens;

        if (effective.Count >= 2 && ContainsSequence(name, effective))
            bonus += options.PhraseBonus;

        if (name.Count > 0 && effective.Count > 0 &&
            (name[0] == effective[0] ||
             (effective[0].Length >= options.PrefixMinLength && name[0].StartsWith(effective[0], StringComparison.Ordinal))))
            bonus += options.StartsWithBonus;

        if (allMatched && name.Count == effective.Count && name.SequenceEqual(effective))
            bonus += options.ExactNameBonus;

        if (name.Count > 0)
        {
            var covered = name.Count(effective.Contains);
            bonus += options.NameCoverageBonus * covered / name.Count;
        }

        return bonus;
    }

    /// <summary>A palavra como aparece no nome: a original, ou a correção que bateu ("iphnoe" → "iphone").</summary>
    private static string EffectiveTerm(ProductSearchDocument doc, QueryToken token)
    {
        if (doc.NameSet.Contains(token.Canonical) || token.Corrections.Count == 0)
            return token.Canonical;
        return token.Corrections.FirstOrDefault(doc.NameSet.Contains) ?? token.Canonical;
    }

    private static bool ContainsSequence(IReadOnlyList<string> haystack, IReadOnlyList<string> needle)
    {
        for (var i = 0; i + needle.Count <= haystack.Count; i++)
        {
            var ok = true;
            for (var j = 0; j < needle.Count && ok; j++)
                ok = haystack[i + j] == needle[j];
            if (ok) return true;
        }
        return false;
    }

    private static string BuildCorrectedQuery(ParsedQuery parsed, ProductSearchIndex index)
        => string.Join(' ', parsed.Tokens.Select(t =>
            t.BestCorrection is null
                ? t.Raw
                : index.DisplayForms.TryGetValue(t.BestCorrection, out var display) ? display : t.BestCorrection));

    // ═════════════════════════ Busca completa (filtros, ordenação, página) ═════════════════════════

    public static ProductSearchResponse Execute(ProductSearchIndex index, ProductSearchRequest request, ProductSearchOptions options)
    {
        var pageSize = request.PageSize <= 0
            ? options.DefaultPageSize
            : Math.Min(request.PageSize, options.MaxPageSize);
        var page = Math.Max(1, request.Page);

        var ranked = Rank(request.Q, index, options);
        IEnumerable<RankedProduct> items = ranked.Items;

        if (request.CategoryId.HasValue)
            items = items.Where(r => r.Document.CategoryId == request.CategoryId.Value);
        if (request.MinPrice.HasValue)
            items = items.Where(r => r.Document.Price >= request.MinPrice.Value);
        if (request.MaxPrice.HasValue)
            items = items.Where(r => r.Document.Price <= request.MaxPrice.Value);
        if (request.FreeShipping == true)
            items = items.Where(r => r.Document.FreeShipping);
        if (request.MinRating is > 0)
            items = items.Where(r => r.Document.Rating >= request.MinRating.Value);
        if (!string.IsNullOrEmpty(request.Badge))
            items = items.Where(r => string.Equals(r.Document.Badge, request.Badge, StringComparison.Ordinal));

        // A lista já está em ordem de relevância; as outras ordenações são estáveis e desempatam por ela.
        items = (request.Sort ?? SortRelevance) switch
        {
            SortPriceAsc => items.OrderBy(r => r.Document.Price),
            SortPriceDesc => items.OrderByDescending(r => r.Document.Price),
            SortReviews => items.OrderByDescending(r => r.Document.ReviewCount),
            SortBestSellers => items.OrderByDescending(r => r.Document.CountSold),
            _ => items
        };

        var filtered = items.ToList();

        return new ProductSearchResponse
        {
            Items = filtered.Skip((page - 1) * pageSize).Take(pageSize).Select(r => r.Document.Response).ToList(),
            TotalCount = filtered.Count,
            PageNumber = page,
            PageSize = pageSize,
            Query = ranked.Query.Original,
            CorrectedQuery = ranked.CorrectedQuery,
            IsPartialMatch = ranked.IsPartialMatch
        };
    }

    // ═════════════════════════ Autocomplete ═════════════════════════

    public static ProductSuggestResponse Suggest(ProductSearchIndex index, string? query, int limit, ProductSearchOptions options)
    {
        var ranked = Rank(query, index, options);
        var max = limit <= 0 ? options.SuggestDefaultLimit : Math.Min(limit, options.SuggestMaxLimit);

        var response = new ProductSuggestResponse
        {
            Query = ranked.Query.Original,
            CorrectedQuery = ranked.CorrectedQuery,
            IsPartialMatch = ranked.IsPartialMatch,
            TotalCount = ranked.Items.Count,
            Products = ranked.Items.Take(max).Select(r => new ProductSuggestionItem
            {
                Id = r.Document.Id,
                Name = r.Document.Name,
                Price = r.Document.Price,
                OriginPrice = r.Document.OriginPrice,
                Image = r.Document.FirstImage,
                CategoryId = r.Document.CategoryId,
                CategoryName = r.Document.CategoryName,
                Badge = r.Document.Badge,
                FreeShipping = r.Document.FreeShipping,
                InStock = r.Document.TotalStock > 0,
                Rating = r.Document.Rating,
                ReviewCount = r.Document.ReviewCount
            }).ToList()
        };

        if (ranked.CorrectedQuery is not null)
            response.Suggestions.Add(new SearchTermSuggestion { Type = "correction", Text = ranked.CorrectedQuery, Count = ranked.Items.Count });

        // Categorias reais dos resultados encontrados (nunca categorias sem produto para esta busca).
        response.Suggestions.AddRange(ranked.Items
            .GroupBy(r => r.Document.CategoryId)
            .Select(g => new SearchTermSuggestion
            {
                Type = "category",
                Text = g.First().Document.CategoryName,
                CategoryId = g.Key,
                Count = g.Count()
            })
            .OrderByDescending(s => s.Count)
            .ThenBy(s => s.Text, StringComparer.Ordinal)
            .Take(3));

        return response;
    }
}
