/**
 * Entité Incident : représente une période où un service est DOWN.
 * 
 * Pure logique métier, sans dépendance à Prisma ou NestJS.
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
   * Un incident est "ouvert" si non résolu.
   */
  isOpen(): boolean {
    return this.resolvedAt === null;
  }

  /**
   * Durée totale de l'incident en millisecondes.
   * Si toujours ouvert, calcule depuis startedAt jusqu'à maintenant.
   */
  durationMs(now: Date = new Date()): number {
    const end = this.resolvedAt ?? now;
    return end.getTime() - this.startedAt.getTime();
  }
}