#nullable enable
using Baldan.Pricing.Application.Domain.Entities;
using Pricing.Api.DTOs.Responses;

namespace Mercado.Craibas.Application.Search;

/// <summary>
/// Monta o índice a partir das listas vindas do banco.
///
/// Regras de visibilidade: as MESMAS do GET /api/v1/product/list (ProductService.GetProductList):
///   - produto Ativo == true e não removido (Isdelete != true);
///   - pelo menos uma variante não removida;
///   - categoria existente, ativa e não removida.
/// Imagens removidas não entram (igual à lista).
/// </summary>
public static class ProductSearchIndexBuilder
{
    public static ProductSearchIndex Build(
        IEnumerable<Product> products,
        IEnumerable<Product_Category> categories,
        IEnumerable<Variante_Products> variants,
        IEnumerable<Imagens_Products> images,
        ProductSearchOptions options)
    {
        var activeCategories = categories
            .Where(c => c.Isdelete != true && c.Ativo)
            .GroupBy(c => c.Id)
            .ToDictionary(g => g.Key, g => g.First());

        var variantsByProduct = variants
            .Where(v => v.Isdelete != true)
            .GroupBy(v => v.Id_Product)
            .ToDictionary(g => g.Key, g => g.OrderBy(v => v.Id).ToList());

        var imagesByProduct = images
            .Where(i => i.Isdelete != true)
            .GroupBy(i => i.Id_Product)
            .ToDictionary(g => g.Key, g => g.OrderBy(i => i.Id).ToList());

        var accessoryWords = Canonicalize(options.AccessoryWords);
        var accessoryCategoryWords = Canonicalize(options.AccessoryCategoryWords);

        var documents = new List<ProductSearchDocument>();
        var postings = new Dictionary<string, List<int>>(StringComparer.Ordinal);
        var vocabulary = new Dictionary<string, int>(StringComparer.Ordinal);
        var displayCounts = new Dictionary<string, Dictionary<string, int>>(StringComparer.Ordinal);

        foreach (var product in products.Where(p => p.Ativo == true && p.Isdelete != true).OrderBy(p => p.Id))
        {
            if (!variantsByProduct.TryGetValue(product.Id, out var productVariants) || productVariants.Count == 0)
                continue;

            if (!activeCategories.TryGetValue(product.Id_Category, out var category))
                continue;

            var productImages = imagesByProduct.TryGetValue(product.Id, out var imgs) ? imgs : new List<Imagens_Products>();

            var namePairs = SearchText.TokenizePairs(product.Name);
            var nameTokens = namePairs.Select(p => p.Canonical).ToList();
            var tagPairs = SearchText.TokenizePairs((product.Tags ?? string.Empty).Replace(',', ' '));
            var categoryPairs = SearchText.TokenizePairs(category.Category);
            var variantTokens = productVariants
                .SelectMany(v => SearchText.Tokenize($"{v.Name} {v.Value} {v.Type}"))
                .ToList();
            var descriptionTokens = SearchText.Tokenize(product.Description);

            var nameSet = new HashSet<string>(nameTokens, StringComparer.Ordinal);
            var tagSet = new HashSet<string>(tagPairs.Select(p => p.Canonical), StringComparer.Ordinal);
            var categorySet = new HashSet<string>(categoryPairs.Select(p => p.Canonical), StringComparer.Ordinal);
            var variantSet = new HashSet<string>(variantTokens, StringComparer.Ordinal);
            var descriptionSet = new HashSet<string>(descriptionTokens, StringComparer.Ordinal);

            var isAccessory =
                (nameTokens.Count > 0 && accessoryWords.Contains(nameTokens[0])) ||
                categorySet.Overlaps(accessoryCategoryWords);

            var document = new ProductSearchDocument
            {
                Id = product.Id,
                Name = product.Name,
                CategoryId = category.Id,
                CategoryName = category.Category,
                Price = product.Price_Unit,
                OriginPrice = product.Origin_Price,
                Rating = product.Rating ?? 0,
                ReviewCount = product.ReviewCount ?? 0,
                CountSold = product.CountSold,
                TotalStock = product.Total_Stock,
                FreeShipping = product.FreeShipping,
                Badge = product.Badge,
                FirstImage = productImages.FirstOrDefault()?.Url_Imagem,
                Response = ToResponse(product, category, productVariants, productImages),
                NameTokens = nameTokens,
                NameSet = nameSet,
                TagSet = tagSet,
                CategorySet = categorySet,
                VariantSet = variantSet,
                DescriptionSet = descriptionSet,
                NameNumbers = new HashSet<string>(nameTokens.Where(SearchText.IsNumber), StringComparer.Ordinal),
                OtherNumbers = new HashSet<string>(
                    tagSet.Concat(variantSet).Where(SearchText.IsNumber), StringComparer.Ordinal),
                IsAccessory = isAccessory
            };

            var position = documents.Count;
            documents.Add(document);

            var allTokens = new HashSet<string>(StringComparer.Ordinal);
            allTokens.UnionWith(nameSet);
            allTokens.UnionWith(tagSet);
            allTokens.UnionWith(categorySet);
            allTokens.UnionWith(variantSet);
            allTokens.UnionWith(descriptionSet);
            foreach (var token in allTokens)
            {
                if (!postings.TryGetValue(token, out var list))
                    postings[token] = list = new List<int>();
                list.Add(position);
            }

            var strongTokens = new HashSet<string>(StringComparer.Ordinal);
            strongTokens.UnionWith(nameSet);
            strongTokens.UnionWith(tagSet);
            strongTokens.UnionWith(categorySet);
            strongTokens.UnionWith(variantSet);
            foreach (var token in strongTokens)
                vocabulary[token] = vocabulary.TryGetValue(token, out var count) ? count + 1 : 1;

            foreach (var (raw, canonical) in namePairs.Concat(tagPairs).Concat(categoryPairs))
            {
                if (!displayCounts.TryGetValue(canonical, out var forms))
                    displayCounts[canonical] = forms = new Dictionary<string, int>(StringComparer.Ordinal);
                forms[raw] = forms.TryGetValue(raw, out var c) ? c + 1 : 1;
            }
        }

        var displayForms = displayCounts.ToDictionary(
            kv => kv.Key,
            kv => kv.Value.OrderByDescending(f => f.Value).ThenBy(f => f.Key, StringComparer.Ordinal).First().Key,
            StringComparer.Ordinal);

        return new ProductSearchIndex(
            documents,
            postings,
            vocabulary,
            displayForms,
            activeCategories.Values.OrderBy(c => c.Id).ToList());
    }

    internal static HashSet<string> Canonicalize(IEnumerable<string> words)
        => new(words.SelectMany(w => SearchText.Tokenize(w, removeStopWords: false)), StringComparer.Ordinal);

    /// <summary>Mesmo preenchimento do ProductService.GetProductList, campo a campo.</summary>
    private static ProductResponse ToResponse(
        Product product,
        Product_Category category,
        List<Variante_Products> variants,
        List<Imagens_Products> images)
    {
        return new ProductResponse
        {
            Id = product.Id,
            Name = product.Name,
            Description = product.Description,
            Price_Unic = product.Price_Unit,
            Origin_Price = product.Origin_Price,
            Imagens = images.Cast<Imagens_Products?>().ToList(),
            Id_category = category.Id,
            Rating = product.Rating,
            Review_Count = product.ReviewCount,
            Count_Sold = product.CountSold,
            variations = variants.Cast<Variante_Products?>().ToList(),
            Total_Stock = product.Total_Stock,
            Badge = product.Badge,
            FreeShipping = product.FreeShipping,
            Installments = product.installments,
            Tags = product.Tags,
            Featured = product.Featured,
            InsertDate = product.InsertDate,
            Ativo = product.Ativo,
            ShowBanner = product.ShowBanner,
        };
    }
}
