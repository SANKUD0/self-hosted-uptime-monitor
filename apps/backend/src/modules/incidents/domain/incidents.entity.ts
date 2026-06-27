/**
 * Incident entity: represents a time window where a service is DOWN.
 *
 * Pure domain logic with no Prisma or NestJS dependencies.
 */
export class Incident {
  constructor(
    public readonly id: string,
    public readonly serviceId: string,
    public readonly startedAt: Date,
    public readonly resolvedAt: Date | null,
    public readonly reason: string | null,
  ) {}

  /**
   * An incident is considered open until resolved.
   */
  isOpen(): boolean {
    return this.resolvedAt === null;
  }

  /**
   * Total incident duration in milliseconds.
   * For open incidents, computes duration from startedAt to now.
   */
  durationMs(now: Date = new Date()): number {
    const end = this.resolvedAt ?? now;
    return end.getTime() - this.startedAt.getTime();
  }
}