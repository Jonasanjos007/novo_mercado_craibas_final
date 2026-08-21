using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Mercado.Craibas.Application.Interfaces
{
    public interface IEmailService
    {
        Task<bool> EnviarEmailAsync(string destinatario,string assunto,string html);
        string EmailPedidoLayout( string titulo, string subtitulo, string conteudoHtml, string status, string? textoBotao = null, string? linkBotao = null);
    }
}
