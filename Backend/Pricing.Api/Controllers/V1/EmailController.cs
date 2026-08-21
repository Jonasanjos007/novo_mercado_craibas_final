using backend.services.interfaces;
using Mercado.Craibas.Application.Interfaces;
using Mercado.Craibas.Application.Interfaces.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Pricing.Api.Extensions;
using System.Threading.Tasks;


namespace backend.controllers.v1;

//[Authorize]
[ApiController]
[Route("api/v1/email")]
public class EmailController : ControllerBase
{
    private readonly IEmailService _service;

    public EmailController(IEmailService service)
    {
        _service = service;
    }

    [HttpGet("TesteEmail")]
    public async Task<IActionResult> TesteEmail()
    {
        var enviado = await _service.EnviarEmailAsync(
            "jj9492921@gmail.com",
            "Teste Mercado Craíbas",
            @"
    <div style='
        margin: 0;
        padding: 0;
        background-color: #f5f5f5;
        font-family: Arial, Helvetica, sans-serif;
    '>

        <table width='100%'
               cellpadding='0'
               cellspacing='0'
               border='0'
               style='background-color:#f5f5f5;padding:30px 15px;'>

            <tr>
                <td align='center'>

                    <table width='100%'
                           cellpadding='0'
                           cellspacing='0'
                           border='0'
                           style='
                               max-width:600px;
                               background:#ffffff;
                               border-radius:16px;
                               overflow:hidden;
                           '>

                        <tr>
                            <td align='center'
                                style='
                                    background:#111111;
                                    padding:32px 20px;
                                '>

                                <div style='
                                    font-size:28px;
                                    font-weight:bold;
                                    color:#ffffff;
                                '>
                                    MERCADO
                                    <span style='color:#f97316;'>
                                        CRAÍBAS
                                    </span>
                                </div>

                                <div style='
                                    margin-top:8px;
                                    color:#a3a3a3;
                                    font-size:13px;
                                '>
                                    Sua loja online, pertinho de você.
                                </div>

                            </td>
                        </tr>

                        <tr>
                            <td style='padding:40px 35px;'>

                                <div align='center'
                                     style='font-size:44px;margin-bottom:15px;'>
                                    🎉
                                </div>

                                <h1 style='
                                    margin:0;
                                    text-align:center;
                                    color:#18181b;
                                    font-size:26px;
                                '>
                                    Email funcionando!
                                </h1>

                                <p style='
                                    margin-top:18px;
                                    text-align:center;
                                    color:#52525b;
                                    font-size:15px;
                                    line-height:1.7;
                                '>
                                    Este email foi enviado pelo
                                    <strong>Mercado Craíbas</strong>
                                    através da nossa API .NET usando SMTP.
                                </p>

                                <div style='
                                    margin-top:30px;
                                    padding:22px;
                                    background:#fff7ed;
                                    border:1px solid #fed7aa;
                                    border-radius:12px;
                                    text-align:center;
                                '>

                                    <strong style='color:#ea580c;'>
                                        Tudo certo por aqui! ✅
                                    </strong>

                                    <div style='
                                        margin-top:8px;
                                        color:#78716c;
                                        font-size:14px;
                                        line-height:1.6;
                                    '>
                                        Se você recebeu esta mensagem,
                                        a configuração de envio de emails
                                        está funcionando corretamente.
                                    </div>

                                </div>

                                <div align='center'
                                     style='margin-top:32px;'>

                                    <a href='https://mavihstudio.com.br/'
                                       style='
                                           display:inline-block;
                                           background:#f97316;
                                           color:#ffffff;
                                           text-decoration:none;
                                           padding:14px 30px;
                                           border-radius:10px;
                                           font-weight:bold;
                                       '>
                                        Acessar Mercado Craíbas
                                    </a>

                                </div>

                            </td>
                        </tr>

                        <tr>
                            <td align='center'
                                style='
                                    padding:28px 20px;
                                    background:#fafafa;
                                    color:#a1a1aa;
                                    font-size:12px;
                                '>

                                <strong style='color:#18181b;'>
                                    Mercado Craíbas
                                </strong>

                                <br><br>

                                Este é um email automático.<br>
                                Por favor, não responda esta mensagem.

                                <br><br>

                                © 2026 Mercado Craíbas.
                                Todos os direitos reservados.

                            </td>
                        </tr>

                    </table>

                </td>
            </tr>

        </table>

    </div>
        "
        );

        if (!enviado)
        {
            return BadRequest(new
            {
                success = false,
                message = "Erro ao enviar email."
            });
        }

        return Ok(new
        {
            success = true,
            message = "Email enviado com sucesso!"
        });
    }
}

