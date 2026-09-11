using MailKit.Net.Smtp;
using MailKit.Security;
using Mercado.Craibas.Application.Interfaces;
using Microsoft.Extensions.Configuration;
using MimeKit;

public class EmailService : IEmailService
{
    private readonly IConfiguration _configuration;

    public EmailService(IConfiguration configuration)
    {
        _configuration = configuration;
    }

    public async Task<bool> EnviarEmailAsync(
        string destinatario,
        string assunto,
        string html)
    {
        try
        {
            var smtpHost = _configuration["Email:SmtpHost"];
            var smtpPort = int.Parse(
                _configuration["Email:SmtpPort"] ?? "587"
            );

            var username = _configuration["Email:Username"];
            var password = _configuration["Email:Password"];
            var fromEmail = _configuration["Email:FromEmail"];
            var fromName = _configuration["Email:FromName"];

            var mensagem = new MimeMessage();

            mensagem.From.Add(
                new MailboxAddress(
                    fromName,
                    fromEmail
                )
            );

            mensagem.To.Add(
                MailboxAddress.Parse(destinatario)
            );

            mensagem.Subject = assunto;

            mensagem.Body = new BodyBuilder
            {
                HtmlBody = html
            }.ToMessageBody();

            using var smtp = new SmtpClient();

            // Porta 587 normalmente usa STARTTLS
            await smtp.ConnectAsync(
                smtpHost,
                smtpPort,
                SecureSocketOptions.StartTls
            );

            await smtp.AuthenticateAsync(
                username,
                password
            );

            await smtp.SendAsync(mensagem);

            await smtp.DisconnectAsync(true);

            return true;
        }
        catch (Exception ex)
        {
            Console.WriteLine("ERRO EMAIL:");
            Console.WriteLine(ex.Message);
            Console.WriteLine(ex.ToString());

            return false;
        }
    }
    public string EmailPedidoLayout(
     string titulo,
     string subtitulo,
     string conteudoHtml,
     string status,
     string? textoBotao = null,
     string? linkBotao = null,
     string? whoReceivedIt = null,
     DateTime? customerDeliveryDate = null)
    {
        var statusNormalizado = status
            .Trim()
            .ToUpperInvariant();

        var statusTitulo = "";
        var statusDescricao = "";
        var statusCor = "";
        var statusFundo = "";
        var statusBorda = "";
        var statusIcone = "";

        switch (statusNormalizado)
        {
            case "PENDENTE":
                statusTitulo = "Pedido recebido";
                statusDescricao =
                    "Recebemos seu pedido e estamos aguardando a confirmação para dar continuidade.";
                statusCor = "#d97706";
                statusFundo = "#fffbeb";
                statusBorda = "#fde68a";
                statusIcone = "⏳";
                break;

            case "CONFIRMADO":
                statusTitulo = "Pedido confirmado!";
                statusDescricao =
                    "Seu pedido foi confirmado com sucesso e já está seguindo para a próxima etapa.";
                statusCor = "#2563eb";
                statusFundo = "#eff6ff";
                statusBorda = "#bfdbfe";
                statusIcone = "✅";
                break;

            case "PREPARANDO":
                statusTitulo = "Estamos preparando seu pedido";
                statusDescricao =
                    "Seu pedido já está sendo separado e preparado com todo cuidado para você.";
                statusCor = "#ea580c";
                statusFundo = "#fff7ed";
                statusBorda = "#fed7aa";
                statusIcone = "📦";
                break;

            case "SAIU_PARA_ENTREGA":
                statusTitulo = "Seu pedido saiu para entrega!";
                statusDescricao =
                    "Boas notícias! Seu pedido já está a caminho. Fique atento para recebê-lo.";
                statusCor = "#7c3aed";
                statusFundo = "#f5f3ff";
                statusBorda = "#ddd6fe";
                statusIcone = "🚚";
                break;

            case "ENTREGUE":
                statusTitulo = "Pedido entregue!";
                statusDescricao =
                    "Seu pedido foi entregue com sucesso. Esperamos que você aproveite sua compra!";
                statusCor = "#16a34a";
                statusFundo = "#f0fdf4";
                statusBorda = "#bbf7d0";
                statusIcone = "🎉";
                break;

            case "CANCELADO":
                statusTitulo = "Pedido cancelado";
                statusDescricao =
                    "Seu pedido foi cancelado. Se precisar de ajuda ou tiver alguma dúvida, estamos à disposição.";
                statusCor = "#dc2626";
                statusFundo = "#fef2f2";
                statusBorda = "#fecaca";
                statusIcone = "❌";
                break;

            default:
                statusTitulo = "Atualização do seu pedido";
                statusDescricao =
                    "Há uma nova atualização relacionada ao seu pedido.";
                statusCor = "#52525b";
                statusFundo = "#fafafa";
                statusBorda = "#e4e4e7";
                statusIcone = "📋";
                break;
        }


        // BOTÃO
        var botaoHtml = "";

        var entregaHtml = "";

        if (!string.IsNullOrWhiteSpace(whoReceivedIt) &&
            customerDeliveryDate.HasValue)
        {
            var dataEntrega = customerDeliveryDate.Value
                .ToString("dd/MM/yyyy 'às' HH:mm");

            entregaHtml = $@"
    <table
        role='presentation'
        width='100%'
        cellpadding='0'
        cellspacing='0'
        border='0'
        style='margin-top:22px;'
    >
        <tr>
            <td
                style='
                    background:#f0fdf4;
                    border:1px solid #bbf7d0;
                    border-radius:14px;
                    padding:20px;
                '
            >

                <div
                    style='
                        color:#15803d;
                        font-size:11px;
                        font-weight:700;
                        letter-spacing:1px;
                        text-transform:uppercase;
                    '
                >
                    DADOS DA ENTREGA
                </div>

                <table
                    role='presentation'
                    width='100%'
                    cellpadding='0'
                    cellspacing='0'
                    border='0'
                    style='margin-top:14px;'
                >
                    <tr>

                        <td
                            width='50%'
                            valign='top'
                            style='
                                padding-right:15px;
                                border-right:1px solid #bbf7d0;
                            '
                        >
                            <div
                                style='
                                    color:#86a38e;
                                    font-size:10px;
                                    font-weight:600;
                                    text-transform:uppercase;
                                    letter-spacing:.5px;
                                '
                            >
                                Recebido por
                            </div>

                            <div
                                style='
                                    margin-top:5px;
                                    color:#166534;
                                    font-size:14px;
                                    font-weight:700;
                                '
                            >
                                {whoReceivedIt}
                            </div>
                        </td>

                        <td
                            width='50%'
                            valign='top'
                            style='padding-left:15px;'
                        >
                            <div
                                style='
                                    color:#86a38e;
                                    font-size:10px;
                                    font-weight:600;
                                    text-transform:uppercase;
                                    letter-spacing:.5px;
                                '
                            >
                                Entregue em
                            </div>

                            <div
                                style='
                                    margin-top:5px;
                                    color:#166534;
                                    font-size:14px;
                                    font-weight:700;
                                '
                            >
                                {dataEntrega}
                            </div>
                        </td>

                    </tr>
                </table>

            </td>
        </tr>
    </table>";
        }

        if (!string.IsNullOrWhiteSpace(textoBotao) &&
            !string.IsNullOrWhiteSpace(linkBotao))
        {
            botaoHtml = $@"
        <table
            role='presentation'
            width='100%'
            cellpadding='0'
            cellspacing='0'
            border='0'
            style='margin-top:30px;'
        >
            <tr>
                <td align='center'>

                    <a
                        href='{linkBotao}'
                        style='
                            display:inline-block;
                            background:#f97316;
                            color:#ffffff;
                            text-decoration:none;
                            padding:14px 28px;
                            border-radius:12px;
                            font-size:14px;
                            font-weight:700;
                        '
                    >
                        {textoBotao}
                    </a>

                </td>
            </tr>
        </table>";
        }


        return $@"
<!DOCTYPE html>

<html lang='pt-BR'>

<head>

    <meta charset='UTF-8'>

    <meta
        name='viewport'
        content='width=device-width, initial-scale=1.0'
    >

    <title>{titulo}</title>

</head>


<body
    style='
        margin:0;
        padding:0;
        background:#f4f4f5;
        font-family:Arial,Helvetica,sans-serif;
        color:#18181b;
    '
>

<table
    role='presentation'
    width='100%'
    cellpadding='0'
    cellspacing='0'
    border='0'
    style='
        width:100%;
        background:#f4f4f5;
        padding:35px 15px;
    '
>

<tr>

<td align='center'>


<!-- CONTAINER PRINCIPAL -->

<table
    role='presentation'
    width='100%'
    cellpadding='0'
    cellspacing='0'
    border='0'
    style='
        width:100%;
        max-width:620px;
        background:#ffffff;
        border-radius:20px;
        overflow:hidden;
        border:1px solid #e4e4e7;
    '
>


<!-- ========================== -->
<!-- CABEÇALHO -->
<!-- ========================== -->

<tr>

<td
    align='center'
    style='
        background:#111111;
        padding:34px 20px 30px 20px;
    '
>

    <div
        style='
            font-size:28px;
            line-height:1;
            font-weight:800;
            letter-spacing:-1px;
            color:#ffffff;
        '
    >
        MERCADO

        <span style='color:#f97316;'>
            CRAÍBAS
        </span>

    </div>

    <div
        style='
            margin-top:10px;
            color:#a1a1aa;
            font-size:13px;
        '
    >
        Sua loja online, pertinho de você.
    </div>

</td>

</tr>


<!-- BARRA -->

<tr>
<td
    style='
        height:4px;
        background:#f97316;
        font-size:0;
        line-height:0;
    '
>
    &nbsp;
</td>
</tr>


<!-- ========================== -->
<!-- CONTEÚDO -->
<!-- ========================== -->

<tr>

<td style='padding:38px 34px 35px 34px;'>


    <!-- TÍTULO -->

    <h1
        style='
            margin:0;
            color:#18181b;
            text-align:center;
            font-size:26px;
            line-height:1.25;
            font-weight:800;
        '
    >
        {titulo}
    </h1>


    <p
        style='
            margin:12px 0 0 0;
            text-align:center;
            color:#71717a;
            font-size:14px;
            line-height:1.7;
        '
    >
        {subtitulo}
    </p>


    <!-- ========================== -->
    <!-- STATUS DO PEDIDO -->
    <!-- ========================== -->

    <table
        role='presentation'
        width='100%'
        cellpadding='0'
        cellspacing='0'
        border='0'
        style='margin-top:30px;'
    >

        <tr>

            <td
                style='
                    background:{statusFundo};
                    border:1px solid {statusBorda};
                    border-radius:14px;
                    padding:22px;
                '
            >

                <table
                    role='presentation'
                    width='100%'
                    cellpadding='0'
                    cellspacing='0'
                    border='0'
                >

                    <tr>

                        <td
                            width='50'
                            valign='top'
                            style='
                                font-size:30px;
                                padding-right:14px;
                            '
                        >
                            {statusIcone}
                        </td>


                        <td>

                            <div
                                style='
                                    font-size:11px;
                                    font-weight:700;
                                    letter-spacing:1px;
                                    color:{statusCor};
                                    text-transform:uppercase;
                                '
                            >
                                STATUS DO PEDIDO
                            </div>


                            <div
                                style='
                                    margin-top:4px;
                                    font-size:18px;
                                    font-weight:800;
                                    color:{statusCor};
                                '
                            >
                                {statusTitulo}
                            </div>


                            <div
                                style='
                                    margin-top:8px;
                                    color:#52525b;
                                    font-size:13px;
                                    line-height:1.6;
                                '
                            >
                                {statusDescricao}
                            </div>

                        </td>

                    </tr>

                </table>

            </td>

        </tr>

    </table>


    <!-- ========================== -->
    <!-- DADOS DO PEDIDO -->
    <!-- ========================== -->

    <table
        role='presentation'
        width='100%'
        cellpadding='0'
        cellspacing='0'
        border='0'
        style='margin-top:22px;'
    >

        <tr>

            <td
                style='
                    background:#fafafa;
                    border:1px solid #e4e4e7;
                    border-radius:14px;
                    padding:24px;
                    color:#3f3f46;
                    font-size:14px;
                    line-height:1.7;
                '
            >

                {conteudoHtml}

            </td>

        </tr>

    </table>

{entregaHtml}

    {botaoHtml}


    <!-- ========================== -->
    <!-- AVISO DE SEGURANÇA -->
    <!-- ========================== -->

    <table
        role='presentation'
        width='100%'
        cellpadding='0'
        cellspacing='0'
        border='0'
        style='margin-top:32px;'
    >

        <tr>

            <td
                style='
                    background:#fff7ed;
                    border:1px solid #fed7aa;
                    border-radius:12px;
                    padding:16px;
                '
            >

                <table
                    role='presentation'
                    cellpadding='0'
                    cellspacing='0'
                    border='0'
                >

                    <tr>

                        <td
                            width='34'
                            valign='top'
                            style='
                                font-size:20px;
                                padding-right:10px;
                            '
                        >
                            🔒
                        </td>


                        <td>

                            <div
                                style='
                                    color:#c2410c;
                                    font-size:13px;
                                    font-weight:700;
                                '
                            >
                                Comunicação segura
                            </div>

                            <div
                                style='
                                    margin-top:4px;
                                    color:#78716c;
                                    font-size:12px;
                                    line-height:1.6;
                                '
                            >
                                O Mercado Craíbas nunca solicita
                                sua senha por e-mail.
                            </div>

                        </td>

                    </tr>

                </table>

            </td>

        </tr>

    </table>


</td>

</tr>


<!-- ========================== -->
<!-- RODAPÉ -->
<!-- ========================== -->

<tr>

<td
    align='center'
    style='
        background:#fafafa;
        border-top:1px solid #e4e4e7;
        padding:28px 20px;
    '
>

    <div
        style='
            color:#18181b;
            font-size:14px;
            font-weight:700;
        '
    >
        Mercado Craíbas
    </div>


    <div
        style='
            margin-top:7px;
            color:#a1a1aa;
            font-size:11px;
        '
    >
        A primeira loja online de Craíbas.
    </div>


    <div
        style='
            margin-top:14px;
            color:#a1a1aa;
            font-size:11px;
            line-height:1.7;
        '
    >
        Este é um e-mail automático.<br>
        Por favor, não responda esta mensagem.
    </div>


    <div
        style='
            margin-top:14px;
            color:#d4d4d8;
            font-size:10px;
        '
    >
        © {DateTime.Now.Year} Mercado Craíbas.
        Todos os direitos reservados.
    </div>

</td>

</tr>


</table>

</td>

</tr>

</table>

</body>

</html>";
    }
}