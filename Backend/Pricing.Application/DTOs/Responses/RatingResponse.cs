using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Mercado.Craibas.Application.DTOs.Responses
{
    public class RatingResponse
    {
        public int Id { get; set; }
        public int Id_Product { get; set; }
        public int Id_Order { get; set; }
        public int Id_User_Customer { get; set; }
        public int Ranting { get; set; }
        public string? Comment { get; set; }
        public string? Media { get; set; }
        public bool Recommend { get; set; }
        public DateTime InsertDate { get; set; }
        public DateTime? UpdateDate { get; set; }
        public bool? Isdelete { get; set; }
    }
}
