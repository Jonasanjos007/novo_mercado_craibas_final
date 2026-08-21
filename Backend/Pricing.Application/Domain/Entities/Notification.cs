using Baldan.Pricing.Application.Domain.Entities;

namespace Mercado.Craibas.Application.Domain.Entities
{
    public class Notification : EntityBase
    {
        public string Kind { get; set; }
        public string Title { get; set; }
        public string Description { get; set; }
        public string? Icone { get; set; }
        public string? ActionUrl { get; set; }
        public int? ReferenceId { get; set; }
        public string? ReferenceType { get; set; }

        public ICollection<NotificationUser> NotificationUsers { get; set; }
            = new List<NotificationUser>();
    }
}