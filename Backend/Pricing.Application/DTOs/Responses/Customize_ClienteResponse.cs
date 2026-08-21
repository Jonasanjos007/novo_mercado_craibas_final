using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Mercado.Craibas.Application.DTOs.Responses
{
    public class Customize_ClienteResponse
    {
        public int Id { get; set; }
        public string? Global_Site_Color { get; set; }
        public bool? Tema { get; set; }
        public DateTime InsertDate { get; set; }
        public DateTime? UpdateDate { get; set; }
    }
}
