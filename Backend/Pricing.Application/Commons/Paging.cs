namespace Baldan.Pricing.Application.Commons;

/// <summary>
/// Regras de paginação das telas do admin.
/// Quantidades aceitas: 10, 20, 30, 50 e 100 (as mesmas do seletor da tela).
/// </summary>
public static class Paging
{
    private static readonly int[] AllowedSizes = { 10, 20, 30, 50, 100 };

    public const int DefaultSize = 10;

    public static int Page(int page) => page < 1 ? 1 : page;

    public static int Size(int pageSize) => AllowedSizes.Contains(pageSize) ? pageSize : DefaultSize;

    public static int Skip(int page, int pageSize) => (Page(page) - 1) * Size(pageSize);

    /// <summary>Texto da busca normalizado (sem espaços nas pontas). Null quando vazio.</summary>
    public static string? Term(string? search)
    {
        var term = search?.Trim();
        return string.IsNullOrEmpty(term) ? null : term;
    }

    /// <summary>
    /// Collation binária: comparação exata (diferencia maiúsculas/minúsculas),
    /// igual ao "===" que a tela usava nos filtros de status/tipo/nível.
    /// </summary>
    public const string ExactCollation = "Latin1_General_100_BIN2";
}
