namespace Baldan.Pricing.Application.Domain.Entities;

public abstract class EntityBase
{
    public int Id { get; protected set; }
    public DateTime InsertDate { get; set; }
    public DateTime? UpdateDate { get; set; }
    public bool? Isdelete { get; set; } = false;
}