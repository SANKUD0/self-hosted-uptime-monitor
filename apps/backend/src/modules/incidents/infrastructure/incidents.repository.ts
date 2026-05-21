import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../shared/database/prisma.service';

@Injectable()
export class IncidentsRepository {
  constructor(private readonly prisma: PrismaService) { }

  /**
   * Trouve l'incident ouvert (non résolu) pour un service.
   * Retourne null s'il n'y en a pas.
   */
  async findOpenIncident(serviceId: string) {
    return await this.prisma.incident.findFirst({
      where: {
        serviceId,
        resolvedAt: null,
      },
    });
  }

  /**
   * Ouvre un nouvel incident pour un service.
   */
  async openIncident(serviceId: string, reason: string | null) {
    return await this.prisma.incident.create({
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
  async resolveIncident(incidentId: string) {
    return await this.prisma.incident.update({
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
      return await this.prisma.incident.findMany({
        include: {
          service: {
            select: {
              name: true,
            }
          }
        }
      });
    } catch (error) {
      throw new Error(`Failed to fetch incidents: ${error}`);
    }
  }

  async findServiceByIncidentId(id: string) {
    try {
      const service = await this.prisma.service.findUnique({ where: { id } });
      return service;
    } catch (error) {
      throw new Error(`Failed to fetch service for incident with id ${id}: ${error}`);
    }
  }
  /**
   * Récupère le nombre total d'incidents ouverts (non résolus).
   * @returns Un nombre représentant le total d'incidents ouverts.
   * @throws Error si la requête échoue.
   */
  async getIncidentsCountOpen() {
    try {
      const count = await this.prisma.incident.count({
        where: {
          resolvedAt: null,
        }
      });
      return count;
    } catch (error) {
      throw new Error(`Failed to fetch incidents count: ${error}`);
    }
  }
}