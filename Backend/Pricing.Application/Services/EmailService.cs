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

    public async Task<bool> EnviarEmailAsync(string destinatario,string assunto,string html)
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

    public string EmailConfirmacaoCadastro(string nome,string codigo)
    {
        return $@"
<!DOCTYPE html>
<html lang='pt-BR'>
<head>
    <meta charset='UTF-8'>
    <meta name='viewport' content='width=device-width, initial-scale=1.0'>
    <title>Confirmação de e-mail</title>
</head>

<body style='
    margin:0;
    padding:0;
    background-color:#f5f5f5;
    font-family:Arial, Helvetica, sans-serif;
    color:#1f2937;
'>

<table width='100%' cellpadding='0' cellspacing='0' border='0'
       style='background-color:#f5f5f5; padding:40px 15px;'>

    <tr>
        <td align='center'>

            <table width='100%' cellpadding='0' cellspacing='0' border='0'
                   style='
                       max-width:600px;
                       background:#ffffff;
                       border-radius:12px;
                       overflow:hidden;
                       box-shadow:0 2px 8px rgba(0,0,0,0.06);
                   '>

                <!-- HEADER -->
                <tr>
                    <td style='
                        padding:28px 30px;
                        border-bottom:1px solid #f1f1f1;
                    '>

                        <div style='
                            font-size:25px;
                            font-weight:bold;
                            color:#f97316;
                        '>
                            Mercado Craíbas
                        </div>

                    </td>
                </tr>

                <!-- CONTEÚDO -->
                <tr>
                    <td style='padding:35px 30px 30px 30px;'>

                        <p style='
                            margin:0;
                            font-size:16px;
                            line-height:1.6;
                        '>
                            Olá, <strong>{nome}</strong>!
                        </p>

                        <p style='
                            margin:16px 0 0 0;
                            font-size:15px;
                            line-height:1.6;
                            color:#4b5563;
                        '>
                            Para continuar seu cadastro no
                            <strong style='color:#f97316;'>
                                Mercado Craíbas
                            </strong>,
                            precisamos confirmar seu endereço de e-mail.
                        </p>

                        <p style='
                            margin:24px 0 0 0;
                            font-size:15px;
                            line-height:1.6;
                            color:#4b5563;
                        '>
                            Digite o código abaixo na tela de confirmação:
                        </p>

                        <!-- CÓDIGO -->
                        <table width='100%' cellpadding='0' cellspacing='0' border='0'
                               style='margin:28px 0;'>

                            <tr>
                                <td align='center'>

                                    <div style='
                                        display:inline-block;
                                        background:#fff7ed;
                                        border:1px solid #fed7aa;
                                        border-radius:10px;
                                        padding:18px 35px;
                                        letter-spacing:8px;
                                        font-size:32px;
                                        font-weight:bold;
                                        color:#f97316;
                                    '>
                                        {codigo}
                                    </div>

                                </td>
                            </tr>

                        </table>

                        <p style='
                            margin:0;
                            text-align:center;
                            font-size:13px;
                            color:#6b7280;
                        '>
                            Este código é válido por
                            <strong>10 minutos</strong>.
                        </p>

                        <p style='
                            margin:25px 0 0 0;
                            font-size:14px;
                            line-height:1.6;
                            color:#6b7280;
                        '>
                            Se você não solicitou este código,
                            pode ignorar este e-mail com segurança.
                        </p>

                    </td>
                </tr>

                <!-- FOOTER -->
                <tr>
                    <td style='
                        background:#fafafa;
                        border-top:1px solid #f1f1f1;
                        padding:24px 30px;
                        text-align:center;
                    '>

                        <p style='
                            margin:0;
                            font-size:13px;
                            color:#6b7280;
                        '>
                            © {DateTime.Now.Year} Mercado Craíbas
                        </p>

                        <p style='
                            margin:8px 0 0 0;
                            font-size:12px;
                            color:#9ca3af;
                        '>
                            Este é um e-mail automático. Por favor,
                            não responda a esta mensagem.
                        </p>

                    </td>
                </tr>

            </table>

        </td>
    </tr>

</table>

</body>
</html>";
    }

    public string EmailContaDesativada(string nome,int idCliente,string email,string telefoneSuporte,string linkSuporte,string responsavelExclusao)
    {
        string mensagemExclusao;

        if (responsavelExclusao == "ADMIN")
        {
            // Texto que já existe hoje para exclusão feita pelo administrador
            mensagemExclusao = @"
            <p>
                Sua conta foi temporariamente desativada pela nossa equipe de suporte.
            </p>
            <p>
                No momento, você não poderá acessar sua conta ou realizar compras.
            </p>
            <p>
                Caso tenha alguma dúvida ou queira solicitar a recuperação da conta,
                entre em contato com nosso suporte.
            </p>";
        }
        else if (responsavelExclusao == "CLIENTE")
        {
            mensagemExclusao = @"
            <p>
                Você solicitou a exclusão da sua conta.
            </p>
            <p>
                Ao excluir sua conta, você perderá o acesso a esta conta e aos recursos
                vinculados a ela.
            </p>
            <p>
                Caso queira cancelar a exclusão e recuperar sua conta,
                entre em contato com nosso suporte.
            </p>";
        }
        else
        {
            mensagemExclusao = @"
            <p>
                Sua conta foi temporariamente desativada.
            </p>
            <p>
                Caso precise de ajuda ou queira solicitar a recuperação da conta,
                entre em contato com nosso suporte.
            </p>";
        }

        return $@"
<!DOCTYPE html>
<html lang='pt-BR'>
<head>
    <meta charset='UTF-8'>
    <meta name='viewport' content='width=device-width, initial-scale=1.0'>
    <title>Conta desativada - Mercado Craíbas</title>
</head>

<body style='margin:0; padding:0; background-color:#f5f5f5; font-family:Arial, Helvetica, sans-serif;'>

    <table width='100%' cellpadding='0' cellspacing='0' style='background-color:#f5f5f5; padding:30px 10px;'>
        <tr>
            <td align='center'>

                <table width='600' cellpadding='0' cellspacing='0'
                       style='max-width:600px; width:100%; background:#ffffff; border-radius:12px; overflow:hidden;'>

                    <!-- HEADER -->
                    <tr>
                        <td style='background:#111111; padding:25px; text-align:center;'>
                            <h1 style='margin:0; color:#ffffff; font-size:28px;'>
                                Mercado <span style='color:#f97316;'>Craíbas</span>
                            </h1>
                        </td>
                    </tr>

                    <!-- ALERTA -->
                    <tr>
                        <td style='background:#dc2626; padding:12px; text-align:center;'>
                            <strong style='color:#ffffff; font-size:14px;'>
                                CONTA TEMPORARIAMENTE DESATIVADA
                            </strong>
                        </td>
                    </tr>

                    <!-- CONTEÚDO -->
                    <tr>
                        <td style='padding:35px 30px;'>

                            <h2 style='margin:0 0 20px; color:#111111; font-size:24px;'>
                                Conta temporariamente desativada
                            </h2>

                            <p style='font-size:16px; color:#333333;'>
                                Olá, <strong>{nome}</strong>.
                            </p>

                            {mensagemExclusao}

                            <!-- DADOS DA CONTA -->
                            <table width='100%' cellpadding='0' cellspacing='0'
                                   style='margin-top:25px; background:#f8f8f8; border-radius:8px;'>
                                <tr>
                                    <td style='padding:20px;'>

                                        <p style='margin:0 0 10px; color:#777777; font-size:12px;'>
                                            DADOS DA CONTA
                                        </p>

                                        <p style='margin:5px 0; color:#222222;'>
                                            <strong>Nome:</strong> {nome}
                                        </p>

                                        <p style='margin:5px 0; color:#222222;'>
                                            <strong>ID do cliente:</strong> #{idCliente}
                                        </p>

                                        <p style='margin:5px 0; color:#222222;'>
                                            <strong>E-mail:</strong> {email}
                                        </p>

                                    </td>
                                </tr>
                            </table>

                            <!-- SUPORTE -->
                            <table width='100%' cellpadding='0' cellspacing='0'
                                   style='margin-top:25px; background:#fff7ed; border:1px solid #fed7aa; border-radius:8px;'>
                                <tr>
                                    <td style='padding:22px; text-align:center;'>

                                        <p style='margin:0 0 8px; color:#111111; font-size:18px; font-weight:bold;'>
                                            PRECISA DE AJUDA?
                                        </p>

                                        <p style='margin:0 0 15px; color:#555555;'>
                                            Entre em contato com nosso suporte.
                                        </p>

                                        <p style='margin:0 0 20px; color:#111111; font-weight:bold;'>
                                            {telefoneSuporte}
                                        </p>

                                        <a href='{linkSuporte}'
                                           target='_blank'
                                           style='display:inline-block; background:#f97316; color:#ffffff;
                                                  text-decoration:none; padding:12px 25px;
                                                  border-radius:6px; font-weight:bold;'>
                                            Entrar em contato com o suporte
                                        </a>

                                    </td>
                                </tr>
                            </table>

                            <!-- SEGURANÇA -->
                            <p style='margin-top:30px; font-size:12px; color:#777777; line-height:1.5;'>
                                Por segurança, o Mercado Craíbas nunca solicitará sua senha
                                por e-mail. Caso receba alguma mensagem suspeita,
                                entre em contato diretamente com nosso suporte.
                            </p>

                        </td>
                    </tr>

                    <!-- FOOTER -->
                    <tr>
                        <td style='background:#111111; padding:20px; text-align:center;'>
                            <p style='margin:0; color:#999999; font-size:12px;'>
                                © Mercado Craíbas - Todos os direitos reservados.
                            </p>
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