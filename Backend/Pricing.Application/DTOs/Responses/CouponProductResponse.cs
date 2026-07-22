using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Mercado.Craibas.Application.DTOs.Responses
{
    public class CouponProductResponse
    {
        public int Id { get; set; }
        public int Id_Cupom { get; set; }

        public int Id_Product { get; set; }
        public DateTime? InsertDate { get; set; }
        public DateTime? UpdateDate { get; set; }
    }
}
