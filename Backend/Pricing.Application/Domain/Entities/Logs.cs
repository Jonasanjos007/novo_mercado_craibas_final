using Baldan.Pricing.Application.Domain.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Mercado.Craibas.Application.Domain.Entities
{
    public class Logs : EntityBase
    {
        public int Id_User { get; set; }
        public string Log { get; set; }
        public string Tipo { get; set; }
        public string Nivel { get; set; }
        public string Acao { get; set; }
        public string Info { get; set; }
    }
}
