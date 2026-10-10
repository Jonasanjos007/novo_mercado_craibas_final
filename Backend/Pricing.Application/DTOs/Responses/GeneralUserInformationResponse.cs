using Org.BouncyCastle.Asn1.Ocsp;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Mercado.Craibas.Application.DTOs.Responses
{
    public class GeneralUserInformationResponse
    {
        public int OrdersAmount { get; set; }
        public int OrdersDelivered { get; set; }
        public int OrdersCanceled { get; set; }
        public int CouponAmount { get; set; }
        public bool EmptyCart { get; set; }
        public double TotalExpenses { get; set; }
        public bool PaymentRequestPending { get; set; }
    }
}
