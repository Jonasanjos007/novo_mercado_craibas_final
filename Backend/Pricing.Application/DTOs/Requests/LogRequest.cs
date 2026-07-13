using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Mercado.Craibas.Application.DTOs.Requests
{
    public class LogRequest
    {
        public int Id_User { get; set; }
        public string Log { get; set; }
        public string Tipo { get; set; }
        public string Nivel { get; set; }
        public string Acao { get; set; }
        public string Info { get; set; }
        public DateTime InsertDate { get; set; }
    }
}
