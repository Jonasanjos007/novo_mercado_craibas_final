#nullable enable
using Mercado.Craibas.Application.Interfaces.Services;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;

namespace Mercado.Craibas.Application.Payments;

/// <summary>
/// Rotina em segundo plano: a cada minuto procura PIX vencidos, confere no Mercado Pago
/// (o cliente pode ter pago no último minuto) e, se não foi pago, marca EXPIRADO e avisa
/// cliente (e-mail + notificação) e administradores (notificação + log).
/// </summary>
public sealed class PaymentExpirationWorker : BackgroundService
{
    private readonly IServiceScopeFactory _scopeFactory;
    private readonly MercadoPagoOptions _options;
    private readonly ILogger<PaymentExpirationWorker> _logger;

    public PaymentExpirationWorker(IServiceScopeFactory scopeFactory, IOptions<MercadoPagoOptions> options, ILogger<PaymentExpirationWorker> logger)
    {
        _scopeFactory = scopeFactory;
        _options = options.Value;
        _logger = logger;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        if (!_options.IsConfigured)
        {
            _logger.LogInformation("Mercado Pago não configurado: rotina de expiração do PIX desligada.");
            return;
        }

        var interval = TimeSpan.FromSeconds(Math.Max(15, _options.ExpirationCheckIntervalSeconds));

        // Espera a API subir antes da primeira rodada.
        try { await Task.Delay(TimeSpan.FromSeconds(20), stoppingToken); }
        catch (OperationCanceledException) { return; }

        while (!stoppingToken.IsCancellationRequested)
        {
            try
            {
                using var scope = _scopeFactory.CreateScope();
                var service = scope.ServiceProvider.GetRequiredService<IPaymentService>();
                var expired = await service.ExpireOverduePixAsync(stoppingToken);
                if (expired > 0)
                    _logger.LogInformation("Pagamento: {Count} PIX expirado(s) nesta rodada.", expired);
            }
            catch (OperationCanceledException) when (stoppingToken.IsCancellationRequested)
            {
                break;
            }
            catch (Exception ex)
            {
                // Banco fora do ar, tabela ainda sem migration etc.: tenta de novo na próxima rodada.
                _logger.LogError(ex, "Pagamento: falha na rotina de expiração do PIX.");
            }

            try { await Task.Delay(interval, stoppingToken); }
            catch (OperationCanceledException) { break; }
        }
    }
}
