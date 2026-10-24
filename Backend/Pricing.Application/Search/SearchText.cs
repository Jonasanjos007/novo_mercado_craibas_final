#nullable enable
using System.Globalization;
using System.Text;

namespace Mercado.Craibas.Application.Search;

/// <summary>
/// Normalização e tokenização usadas tanto no índice quanto na consulta.
/// Os dois lados passam pelas mesmas regras, então "Garrafa TÉRMICA" e "garrafa termica" viram os mesmos tokens.
/// </summary>
public static class SearchText
{
    /// <summary>Palavras sem valor de busca (artigos, preposições).</summary>
    private static readonly HashSet<string> StopWords = new(StringComparer.Ordinal)
    {
        "a", "o", "e", "as", "os", "um", "uma", "uns", "umas",
        "de", "da", "do", "das", "dos", "em", "no", "na", "nos", "nas",
        "para", "pra", "por", "com", "ao", "aos", "ou"
    };

    /// <summary>
    /// Minúsculas, sem acentos, pontuação vira espaço, espaços repetidos viram um.
    /// </summary>
    public static string Normalize(string? text)
    {
        if (string.IsNullOrWhiteSpace(text))
            return string.Empty;

        var decomposed = text.Normalize(NormalizationForm.FormD);
        var sb = new StringBuilder(decomposed.Length);
        var lastWasSpace = true;

        foreach (var ch in decomposed)
        {
            var category = CharUnicodeInfo.GetUnicodeCategory(ch);
            if (category == UnicodeCategory.NonSpacingMark)
                continue;

            if (char.IsLetterOrDigit(ch))
            {
                sb.Append(char.ToLowerInvariant(ch));
                lastWasSpace = false;
            }
            else if (!lastWasSpace)
            {
                sb.Append(' ');
                lastWasSpace = true;
            }
        }

        return sb.ToString().Trim();
    }

    /// <summary>
    /// Separa em tokens, já normalizados e no singular simples.
    /// Letras e números grudados viram tokens separados ("iphone17" → "iphone", "17"; "128gb" → "128", "gb").
    /// </summary>
    public static List<string> Tokenize(string? text, bool removeStopWords = true)
        => TokenizePairs(text, removeStopWords).Select(p => p.Canonical).ToList();

    /// <summary>Como <see cref="Tokenize"/>, devolvendo também a forma escrita (antes do singular).</summary>
    public static List<(string Raw, string Canonical)> TokenizePairs(string? text, bool removeStopWords = true)
    {
        var normalized = Normalize(text);
        var tokens = new List<(string Raw, string Canonical)>();
        if (normalized.Length == 0)
            return tokens;

        foreach (var piece in normalized.Split(' ', StringSplitOptions.RemoveEmptyEntries))
        {
            var start = 0;
            for (var i = 1; i <= piece.Length; i++)
            {
                var boundary = i == piece.Length || char.IsDigit(piece[i]) != char.IsDigit(piece[i - 1]);
                if (!boundary)
                    continue;

                var raw = piece.Substring(start, i - start);
                start = i;

                if (removeStopWords && StopWords.Contains(raw))
                    continue;

                tokens.Add((raw, Canonical(raw)));
            }
        }

        return tokens;
    }

    public static bool IsNumber(string token) => token.Length > 0 && token.All(char.IsDigit);

    /// <summary>
    /// Plural simples do português para o singular, aplicado igual no índice e na consulta:
    /// "garrafas" → "garrafa", "carregadores" → "carregador", "cartoes" → "cartao", "itens" → "item".
    /// Números não mudam (zeros à esquerda são removidos: "07" = "7").
    /// </summary>
    public static string Canonical(string token)
    {
        if (token.Length == 0)
            return token;

        if (IsNumber(token))
        {
            var trimmed = token.TrimStart('0');
            return trimmed.Length == 0 ? "0" : trimmed;
        }

        if (token.Length > 4 && token.EndsWith("oes", StringComparison.Ordinal))
            return token[..^3] + "ao";
        if (token.Length > 4 && token.EndsWith("res", StringComparison.Ordinal))
            return token[..^2];
        if (token.Length > 4 && token.EndsWith("ns", StringComparison.Ordinal))
            return token[..^2] + "m";
        if (token.Length > 3 && token.EndsWith('s') && !token.EndsWith("ss", StringComparison.Ordinal))
            return token[..^1];

        return token;
    }

    /// <summary>
    /// Distância de Damerau-Levenshtein (com transposição: "iphnoe" → "iphone" = 1).
    /// Para assim que passa de <paramref name="max"/> e devolve max + 1.
    /// </summary>
    public static int EditDistance(string a, string b, int max)
    {
        if (Math.Abs(a.Length - b.Length) > max)
            return max + 1;

        var d = new int[a.Length + 1, b.Length + 1];
        for (var i = 0; i <= a.Length; i++) d[i, 0] = i;
        for (var j = 0; j <= b.Length; j++) d[0, j] = j;

        for (var i = 1; i <= a.Length; i++)
        {
            var rowMin = int.MaxValue;
            for (var j = 1; j <= b.Length; j++)
            {
                var cost = a[i - 1] == b[j - 1] ? 0 : 1;
                var value = Math.Min(Math.Min(d[i - 1, j] + 1, d[i, j - 1] + 1), d[i - 1, j - 1] + cost);

                if (i > 1 && j > 1 && a[i - 1] == b[j - 2] && a[i - 2] == b[j - 1])
                    value = Math.Min(value, d[i - 2, j - 2] + 1);

                d[i, j] = value;
                if (value < rowMin) rowMin = value;
            }

            if (rowMin > max)
                return max + 1;
        }

        return d[a.Length, b.Length];
    }
}
