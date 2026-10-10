using Baldan.Pricing.Application.Domain.Entities;
using Mercado.Craibas.Application.Domain.Enums;

namespace Mercado.Craibas.Application.Domain.Entities
{
    public class DeletionRecords : EntityBase
    {
        public EntityTypeDelete? EntityType { get; set; }
        public int EntityId { get; set; }
        public string DisplayName { get; set; } = string.Empty;
        public string DeletedByUserName { get; set; } = string.Empty;
        public DateTime DeletedAt { get; set; }
        public int DeletedByUserId { get; set; }
        public DeletionRecordStatusEnum Status { get; set; } = DeletionRecordStatusEnum.Deleted ;
        public DateTime? RestoredAt { get; set; }
        public int? RestoredByUserId { get; set; }

        /// <summary>Dono do dado excluído (ex: o cliente dono do endereço).</summary>
        public int? OwnerUserId { get; set; }
        public string? OwnerRole { get; set; }

        /// <summary>Perfil de quem excluiu (ADMIN, CLIENTE...).</summary>
        public string? DeletedByRole { get; set; }

        /// <summary>Motivo da exclusão.</summary>
        public string? Reason { get; set; }

        /// <summary>Cópia (JSON) do registro no momento da exclusão.</summary>
        public string? Snapshot { get; set; }

        /// <summary>
        /// Registro "pai" quando o item foi excluído junto com outro
        /// (ex: pedidos e endereços excluídos junto com o usuário).
        /// </summary>
        public int? ParentRecordId { get; set; }

        /// <summary>Exclusão definitiva.</summary>
        public DateTime? PurgedAt { get; set; }
        public int? PurgedByUserId { get; set; }
    }
}