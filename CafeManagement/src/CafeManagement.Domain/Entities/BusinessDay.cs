using CafeManagement.Domain.Common;
using CafeManagement.Domain.Enums;

namespace CafeManagement.Domain.Entities;

public class BusinessDay : AuditableEntity
{
    public DateTime OpenedAt { get; private set; }

    public DateTime? ClosedAt { get; private set; }

    public BusinessDayStatus Status { get; private set; }

    public Guid OpenedBy { get; private set; }

    public Guid? ClosedBy { get; private set; }

    private BusinessDay()
    {
        // Required for EF Core
    }

    public BusinessDay(Guid openedBy)
    {
        OpenedAt = DateTime.UtcNow;
        Status = BusinessDayStatus.Open;
        OpenedBy = openedBy;
    }

    public void Close(Guid closedBy)
    {
        ClosedAt = DateTime.UtcNow;
        ClosedBy = closedBy;
        Status = BusinessDayStatus.Closed;
    }
}