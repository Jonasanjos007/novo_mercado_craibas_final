#nullable enable
namespace Mercado.Craibas.Application.Search;

/// <summary>
/// Pesos e regras da busca de produtos.
///
/// Todos os valores podem ser sobrescritos no appsettings, seção "ProductSearch"
/// (ex.: "ProductSearch": { "NameExact": 12, "Synonyms": { "notebook": ["laptop"] } }).
/// Os valores padrão foram calibrados com o conjunto de consultas dos testes
/// (Mercado.Craibas.Tests/ProductSearchEngineTests.cs). Ao mudar um peso, rode os testes.
///
/// Como a pontuação é montada (por produto):
///   cada palavra digitada vale o MELHOR acerto dela (nome, tags, categoria, variante, descrição,
///   prefixo, sinônimo ou aproximação) + bônus de "todas as palavras", frase, início do nome e nome exato
///   − penalidade de acessório (quando o cliente não pediu acessório) − penalidade de sem estoque.
/// </summary>
public sealed class ProductSearchOptions
{
    public const string SectionName = "ProductSearch";

    // ── Acertos por palavra (vale o maior entre eles) ──────────────────────────
    /// <summary>Palavra igual a uma palavra do nome.</summary>
    public double NameExact { get; set; } = 10;
    /// <summary>Palavra igual a uma tag (as tags são os "apelidos" cadastrados no produto).</summary>
    public double TagExact { get; set; } = 7;
    /// <summary>Palavra igual a uma palavra do nome da categoria.</summary>
    public double CategoryExact { get; set; } = 5;
    /// <summary>Palavra igual a um valor/tipo/nome de variante (cor, voltagem, tamanho).</summary>
    public double VariantExact { get; set; } = 3;
    /// <summary>Palavra presente só na descrição (peso baixo para textos longos não ganharem).</summary>
    public double DescriptionExact { get; set; } = 1;
    /// <summary>Início de uma palavra do nome ("garraf" → "garrafa").</summary>
    public double NamePrefix { get; set; } = 6;
    /// <summary>Início de uma tag ou da categoria.</summary>
    public double OtherPrefix { get; set; } = 3;
    /// <summary>Palavra encontrada por sinônimo (nome, tags ou categoria). Vale menos que a palavra original.</summary>
    public double Synonym { get; set; } = 5;
    /// <summary>Palavra encontrada por aproximação ("iphnoe" → "iphone") no nome.</summary>
    public double FuzzyName { get; set; } = 6;
    /// <summary>Palavra encontrada por aproximação em tags ou categoria.</summary>
    public double FuzzyOther { get; set; } = 4;

    // ── Bônus ────────────────────────────────────────────────────────────────
    /// <summary>Todas as palavras digitadas foram encontradas no produto.</summary>
    public double AllTokensBonus { get; set; } = 15;
    /// <summary>As palavras aparecem juntas e na mesma ordem no nome.</summary>
    public double PhraseBonus { get; set; } = 10;
    /// <summary>O nome começa com a primeira palavra digitada.</summary>
    public double StartsWithBonus { get; set; } = 3;
    /// <summary>O nome é exatamente o que foi digitado.</summary>
    public double ExactNameBonus { get; set; } = 10;
    /// <summary>
    /// Proporção do nome coberta pelas palavras digitadas (0 a este valor).
    /// Desempata "iPhone 17 128GB" à frente de "iPhone 17 Pro Max 256GB" na busca "iphone 17".
    /// Fica abaixo dos demais pesos para nunca inverter um acerto mais forte.
    /// </summary>
    public double NameCoverageBonus { get; set; } = 4;

    // ── Regras comerciais e de intenção ──────────────────────────────────────
    /// <summary>Acessório quando o cliente NÃO pediu acessório ("iphone 17" não deve trazer a capa primeiro).</summary>
    public double AccessoryPenalty { get; set; } = 12;
    /// <summary>Acessório quando o cliente pediu acessório ("capa iphone 17").</summary>
    public double AccessoryBoost { get; set; } = 6;
    /// <summary>Produto sem estoque: só desempata, nunca some da busca.</summary>
    public double OutOfStockPenalty { get; set; } = 3;

    // ── Aproximação e prefixo ────────────────────────────────────────────────
    /// <summary>Tamanho mínimo da palavra para procurar por aproximação.</summary>
    public int FuzzyMinLength { get; set; } = 4;
    /// <summary>Erros aceitos em palavras de 4 a 7 letras.</summary>
    public int FuzzyMaxEditsShort { get; set; } = 1;
    /// <summary>Erros aceitos em palavras com 8 letras ou mais.</summary>
    public int FuzzyMaxEditsLong { get; set; } = 2;
    /// <summary>Tamanho mínimo para buscar por início de palavra.</summary>
    public int PrefixMinLength { get; set; } = 3;
    /// <summary>
    /// Resultado parcial (quando nenhum produto tem todas as palavras):
    /// fração mínima das palavras que precisa ser encontrada. Números nunca podem faltar.
    /// </summary>
    public double PartialMinCoverage { get; set; } = 0.5;

    // ── Limites ──────────────────────────────────────────────────────────────
    public int MaxQueryLength { get; set; } = 100;
    public int MaxQueryTokens { get; set; } = 8;
    public int DefaultPageSize { get; set; } = 24;
    public int MaxPageSize { get; set; } = 48;
    public int SuggestDefaultLimit { get; set; } = 6;
    public int SuggestMaxLimit { get; set; } = 8;
    public int SuggestMinLength { get; set; } = 2;

    /// <summary>
    /// Validade máxima do índice em memória, em segundos. O índice também é refeito na hora
    /// sempre que produto, variante, imagem ou categoria são salvos nesta instância da API.
    /// Com mais de uma instância, é o tempo máximo para as outras enxergarem a mudança.
    /// </summary>
    public int IndexCacheSeconds { get; set; } = 120;

    /// <summary>
    /// Palavras que indicam acessório. Um produto é acessório quando o NOME começa com uma delas
    /// ou quando a categoria contém "acessorio". Uma consulta "pede acessório" quando contém uma delas.
    /// </summary>
    public List<string> AccessoryWords { get; set; } = new()
    {
        "capa", "capinha", "case", "pelicula", "carregador", "cabo", "fonte", "adaptador",
        "suporte", "protetor", "pulseira", "bainha", "estojo", "refil"
    };

    /// <summary>Palavras da categoria que marcam todos os produtos dela como acessórios.</summary>
    public List<string> AccessoryCategoryWords { get; set; } = new() { "acessorio" };

    /// <summary>
    /// Sinônimos (uma direção: a chave também procura os valores).
    /// Escolhidos pelo que clientes digitam em lojas de variedades no Brasil:
    /// - celular/smartphone/telefone: o cliente usa os três para o mesmo aparelho; "celular" também acha iPhone.
    /// - fone/headphone/headset/earbuds: nomes comerciais do mesmo produto.
    /// - notebook/laptop, tv/televisão, capa/case/capinha, garrafa/squeeze, bluetooth/wireless.
    /// "iphone" NÃO procura "celular" de propósito: quem digita a marca quer a marca.
    /// </summary>
    public Dictionary<string, List<string>> Synonyms { get; set; } = new()
    {
        ["celular"] = new() { "smartphone", "iphone", "telefone" },
        ["smartphone"] = new() { "celular", "iphone" },
        ["telefone"] = new() { "celular", "smartphone" },
        ["fone"] = new() { "headphone", "headset", "earphone", "earbud", "auricular" },
        ["headphone"] = new() { "fone", "headset" },
        ["headset"] = new() { "fone", "headphone" },
        ["earbud"] = new() { "fone" },
        ["notebook"] = new() { "laptop" },
        ["laptop"] = new() { "notebook" },
        ["tv"] = new() { "televisao", "televisor" },
        ["televisao"] = new() { "tv", "televisor" },
        ["capa"] = new() { "case", "capinha" },
        ["capinha"] = new() { "capa", "case" },
        ["case"] = new() { "capa", "capinha" },
        ["garrafa"] = new() { "squeeze" },
        ["squeeze"] = new() { "garrafa" },
        ["bluetooth"] = new() { "wireless" },
        ["wireless"] = new() { "bluetooth" },
        ["carregador"] = new() { "fonte" },
        ["caixinha"] = new() { "caixa" }
    };
}
