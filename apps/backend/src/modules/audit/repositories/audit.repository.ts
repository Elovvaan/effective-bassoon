export interface AuditEvent {
  id: string;
  action: string;
  timestamp: string;
}

export class AuditRepository {
  private readonly events: AuditEvent[] = [
    { id: '1', action: 'assignment.created', timestamp: new Date().toISOString() },
  ];

  list(limit: number): AuditEvent[] {
    return this.events.slice(0, limit);
  }
}
