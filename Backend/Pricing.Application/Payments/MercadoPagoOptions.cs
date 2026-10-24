#nullable enable
namespace Mercado.Craibas.Application.Payments;

/// <summary>
/// Configuração do Mercado Pago. Preencha a seção "MercadoPago" do appsettings.json:
///
/// "MercadoPago": {
///   "AccessToken": "APP_USR-... ou TEST-...",   // Suas integrações → Credenciais (NUNCA vai para o front)
///   "PublicKey": "APP_USR-... ou TEST-...",     // vai para o front (formulário de cartão)
///   "WebhookSecret": "...",                      // Suas integrações → Webhooks → Assinatura secreta
///   "PixExpirationHours": 24,
///   "PixDiscountPercent": 0,
///   "MaxInstallments": 12,
///   "SiteUrl": "https://seu-dominio.com.br"
/// }
///
/// Sem AccessToken/PublicKey o site continua funcionando: o checkout avisa que o pagamento
/// está indisponível e nenhum pedido fica preso.
/// </summary>
public sealed class MercadoPagoOptions
{
    public const string SectionName = "MercadoPago";

    public string BaseUrl { get; set; } = "https://api.mercadopago.com";
    public string AccessToken { get; set; } = "";
    public string PublicKey { get; set; } = "";
    /// <summary>Chave secreta dos webhooks. Vazia = assinatura NÃO é validada (só use em teste local).</summary>
    public string WebhookSecret { get; set; } = "";

    /// <summary>Validade do PIX. O Mercado Pago aceita de 30 minutos a 30 dias.</summary>
    public double PixExpirationHours { get; set; } = 24;
    /// <summary>Desconto do PIX em % (0 = sem desconto). Aplicado no servidor sobre o total do pedido.</summary>
    public double PixDiscountPercent { get; set; } = 0;
    /// <summary>Máximo de parcelas aceito no cartão.</summary>
    public int MaxInstallments { get; set; } = 12;

    /// <summary>Endereço do site (links dos e-mails). Ex.: https://mercadocraibas.com.br</summary>
    public string SiteUrl { get; set; } = "https://mavihstudio.com.br/pedidos";

    /// <summary>De quanto em quanto tempo a rotina procura PIX vencidos.</summary>
    public int ExpirationCheckIntervalSeconds { get; set; } = 60;
    /// <summary>Tolerância do horário do webhook (x-signature ts). 0 = não verifica.</summary>
    public int WebhookToleranceMinutes { get; set; } = 0;
    /// <summary>Intervalo mínimo entre consultas ao Mercado Pago quando o front pergunta o status.</summary>
    public int StatusSyncSeconds { get; set; } = 8;

    public bool IsConfigured =>
        !string.IsNullOrWhiteSpace(AccessToken) && !string.IsNullOrWhiteSpace(PublicKey);
}
