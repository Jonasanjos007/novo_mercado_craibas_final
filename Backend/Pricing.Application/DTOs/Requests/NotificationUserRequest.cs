using Mercado.Craibas.Application.Domain.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Mercado.Craibas.Application.DTOs.Requests
{
    public class NotificationUserRequest
    {
        public int NotificationId { get; set; }
        public int UserId { get; set; }
        public bool IsRead { get; set; } = false;

        public DateTime? ReadDate { get; set; }
        public Notification Notification { get; set; }
    }
}
