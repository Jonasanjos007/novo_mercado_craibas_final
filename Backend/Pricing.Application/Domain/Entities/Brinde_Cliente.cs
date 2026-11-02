using System;

namespace Baldan.Pricing.Application.Domain.Entities
{
    public class Brinde_Cliente : EntityBase
    {
        public int Id_Brinde { get; set; }
        public Brinde Brinde { get; set; }
        public int Id_User_Customer { get; set; }
        public User_Customer User_Customer { get; set; }
        public int? Id_Order { get; set; }
        public Orders? Order { get; set; }
        public string Origem { get; set; }
        public string Status { get; set; }
        public DateTime? Entregue_Em { get; set; }
        public string? Quem_Entregou { get; set; }
    }
}
