import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../shared/database/prisma.service';

@Injectable()
export class IncidentsRepository {
  constructor(private readonly prisma: PrismaService) { }

  /**
   * Trouve l'incident ouvert (non résolu) pour un service.
   * Retourne null s'il n'y en a pas.
   */
  findOpenIncident(serviceId: string) {
    return this.prisma.incident.findFirst({
      where: {
        serviceId,
        resolvedAt: null,
      },
    });
  }

  /**
   * Ouvre un nouvel incident pour un service.
   */
  openIncident(serviceId: string, reason: string | null) {
    return this.prisma.incident.create({
      data: {
        serviceId,
        reason,
        // startedAt et notifiedStart/End ont des defaults dans le schema
      },
    });
  }

  /**
   * Marque un incident comme résolu (resolvedAt = now).
   */
  resolveIncident(incidentId: string) {
    return this.prisma.incident.update({
      where: { id: incidentId },
      data: { resolvedAt: new Date() },
    });
  }

  /**
   * Compte les N derniers checks consécutifs DOWN/TIMEOUT pour un service.
   * Utilisé pour détecter le seuil d'échecs.
   */
  async countConsecutiveFailures(serviceId: string, limit: number): Promise<number> {
    // On récupère les N derniers checks (ordre desc)
    const recentChecks = await this.prisma.check.findMany({
      where: { serviceId },
      orderBy: { timestamp: 'desc' },
      take: limit,
      select: { status: true },
    });

    // On compte les échecs depuis le plus récent jusqu'à trouver un UP
    let consecutiveFailures = 0;
    for (const check of recentChecks) {
      if (check.status === 'UP') break;
      consecutiveFailures++;
    }

    return consecutiveFailures;
  }
  
  /**
   * Récupère tous les incidents, avec leurs détails (service, timestamps, etc).
   * 
   * @returns  Une liste d'incidents.
   * @throws Error si la requête échoue.
   * 
   * Note : Cette méthode peut être utilisée pour afficher un tableau de bord des incidents.
   */
  async findAllIncidents() {
    try {
      return await this.prisma.incident.findMany();
    } catch (error) {
      throw new Error(`Failed to fetch incidents: ${error}`);
    }
  }
}