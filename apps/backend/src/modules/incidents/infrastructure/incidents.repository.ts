import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../shared/database/prisma.service';

@Injectable()
export class IncidentsRepository {
  constructor(private readonly prisma: PrismaService) { }

  /**
    * Finds the currently open incident for a service.
    * Returns null when none exists.
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
    * Opens a new incident for a service.
   */
  async openIncident(serviceId: string, reason: string | null) {
    return await this.prisma.incident.create({
      data: {
        serviceId,
        reason,
        // startedAt and notification flags use schema defaults.
      },
    });
  }

  /**
   * Marks an incident as resolved (resolvedAt = now).
   */
  async resolveIncident(incidentId: string) {
    return await this.prisma.incident.update({
      where: { id: incidentId },
      data: { resolvedAt: new Date() },
    });
  }

  /**
   * Counts the N most recent consecutive DOWN/TIMEOUT checks for a service.
   * Used to evaluate the failure threshold.
   */
  async countConsecutiveFailures(serviceId: string, limit: number): Promise<number> {
    // Load the N latest checks ordered from newest to oldest.
    const recentChecks = await this.prisma.check.findMany({
      where: { serviceId },
      orderBy: { timestamp: 'desc' },
      take: limit,
      select: { status: true },
    });

    // Count failures until the first UP status is encountered.
    let consecutiveFailures = 0;
    for (const check of recentChecks) {
      if (check.status === 'UP') break;
      consecutiveFailures++;
    }

    return consecutiveFailures;
  }

  /**
    * Returns all incidents with associated details (service, timestamps, etc.).
    *
    * @returns Incident list.
    * @throws Error when the query fails.
    *
    * Useful for incident dashboard rendering.
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
    * Returns the total number of open incidents.
    * @returns Number of unresolved incidents.
    * @throws Error when the query fails.
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

  /**
    * Resolves an incident with a specified root cause.
    * @param id - Incident ID to resolve.
    * @param rootCause - Root cause of the incident.
    * @returns The resolved incident.
    * @throws Error when the resolution fails.
   */
  async resolveIncidentWithRootCause(id: string, rootCause: string) {
    try {
      return await this.prisma.incident.update({
        where: { id },
        data: { resolvedAt: new Date(), rootCause },
      });
    } catch (error) {
      throw new Error(`Failed to resolve incident with id ${id}: ${error}`);
    }
  }
}