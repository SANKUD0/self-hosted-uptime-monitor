import { Injectable, Logger } from '@nestjs/common';
import { CheckStatus } from '@prisma/client';
import { IncidentsRepository } from '../infrastructure/incidents.repository';
import { NotificationsService } from '../../notifications/application/notifications.service';
import { RealtimeService } from '../../realtime/application/realtime.service';

/**
 * Application service orchestrating incident lifecycle logic.
 *
 * Exposes handleCheckResult(), called by CheckProcessor after each check.
 */
@Injectable()
export class IncidentsService {
  private readonly logger = new Logger(IncidentsService.name);

  constructor(
    private readonly repository: IncidentsRepository,
    private readonly notifications: NotificationsService,
    private readonly realtimeService: RealtimeService
  ) { }

  /**
    * Domain workflow triggered after a single check execution.
    *
    * @param serviceId - checked service ID
    * @param status - check outcome (UP, DOWN, TIMEOUT)
    * @param failureThreshold - consecutive failure count required before opening incident
    * @param errorMessage - optional error payload from the checker
   */
  async handleCheckResult(serviceId: string, status: CheckStatus, failureThreshold: number, errorMessage: string | null,): Promise<void> {
    const openIncident = await this.repository.findOpenIncident(serviceId);

    const service = await this.repository.findServiceByIncidentId(serviceId);

    // CASE 1: service is UP.
    if (status === 'UP') {
      if (openIncident) {
        // Open incident exists, resolve it.
        await this.repository.resolveIncident(openIncident.id);
        this.logger.log(
          `Incident resolved for service ${serviceId}`,
        );

        // Notify incident resolution.
        await this.notifications.notifyAll({
          title: 'Incident resolved',
          message: `Service ${service?.name} is back UP`,
        });

        this.realtimeService.broadcastIncidentsUpdate({
          id: openIncident.id,
          startedAt: openIncident.startedAt.toISOString(),
          resolvedAt: new Date().toISOString(),
          reason: openIncident.reason,
          service: { name: service?.name ?? serviceId },
        });
      }
      // No open incident, nothing to do.
      return;
    }

    // CASE 2: service is DOWN/TIMEOUT.

    // Avoid duplicate incidents when one is already open.
    if (openIncident) return;

    // 1. Count consecutive failures first.
    const consecutiveFailures = await this.repository.countConsecutiveFailures(
      serviceId,
      failureThreshold,
    );

    // 2. Threshold not reached yet.
    if (consecutiveFailures < failureThreshold) {
      return;
    }

    // 3. Threshold reached: open incident.
    const newIncident = await this.repository.openIncident(serviceId, errorMessage);
    this.logger.warn(`Incident opened for service ${serviceId}`);

    // 4. Notify after incident is persisted.
    await this.notifications.notifyAll({
      title: 'Incident detected',
      message: `Service ${service?.name ?? serviceId} is DOWN. Reason: ${errorMessage ?? 'Unknown'}`,
    });

    this.realtimeService.broadcastIncidentsUpdate({
      id: newIncident.id,
      startedAt: newIncident.startedAt.toISOString(),
      resolvedAt: null,
      reason: errorMessage,
      service: { name: service?.name ?? serviceId },
    });
  }

  /**
   * Returns all incidents with details (service, timestamps, etc.).
   * @returns Incident list.
   * @throws Error when the query fails.
   *
   * Typically used by incident dashboards.
   */
  async findAllIncidents() {
    return this.repository.findAllIncidents();
  }

  /**
    * Returns the total number of open incidents.
    * @returns Number of unresolved incidents.
    * @throws Error when the query fails.
   */
  async getIncidentsCountOpen() {
    return this.repository.getIncidentsCountOpen();
  }

  /**
    * Resolves an incident with a specified root cause.
    * @param id - Incident ID to resolve.
    * @param rootCause - Root cause of the incident.
    * @returns The resolved incident.
    * @throws Error when the resolution fails.
   */
  async resolveIncident(id: string, rootCause: string) {
    try {
      return await this.repository.resolveIncidentWithRootCause(id, rootCause);
    } catch (error) {
      throw new Error(`Failed to resolve incident with id ${id}: ${error}`);
    }
  }
}