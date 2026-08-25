using Mercado.Craibas.Application.Domain.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Mercado.Craibas.Application.DTOs.Responses
{
    public class NotificationResponse
    {
        public int IdNotification { get; set; }
        public int IdNotificationUser { get; set; }
        public string Kind { get; set; }
        public string Title { get; set; }
        public string Description { get; set; }
        public string? Icone { get; set; }
        public string Role { get; set; }
        public bool IsRead { get; set; }
        public DateTime? ReadDate { get; set; }
        public string? ActionUrl { get; set; }
        public int? ReferenceId { get; set; }

        public string? ReferenceType { get; set; }

        public DateTime InsertDate { get; set; }
        public DateTime? UpdateDate { get; set; }

    }
}
