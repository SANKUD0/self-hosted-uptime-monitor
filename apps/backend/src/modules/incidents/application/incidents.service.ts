import { Injectable, Logger } from '@nestjs/common';
import { CheckStatus } from '@prisma/client';
import { IncidentsRepository } from '../infrastructure/incidents.repository';
import { NotificationsService } from '../../notifications/application/notifications.service';

/**
 * Service applicatif : orchestre la logique d'incidents.
 * 
 * Exposé via une méthode unique handleCheckResult() qui sera appelée
 * par le CheckProcessor après chaque check.
 */
@Injectable()
export class IncidentsService {
  private readonly logger = new Logger(IncidentsService.name);

  constructor(
    private readonly repository: IncidentsRepository,
    private readonly notifications: NotificationsService
  ) { }

  /**
   * Logique métier déclenchée après un check.
   * 
   * @param serviceId - ID du service checké
   * @param status - Résultat du check (UP, DOWN, TIMEOUT)
   * @param failureThreshold - Nombre d'échecs consécutifs avant incident
   * @param errorMessage - Message d'erreur si applicable
   */
  async handleCheckResult(serviceId: string, status: CheckStatus, failureThreshold: number, errorMessage: string | null,): Promise<void> {
    const openIncident = await this.repository.findOpenIncident(serviceId);

    const service = await this.repository.findServiceByIncidentId(serviceId);


    // CAS 1 : Le service est UP
    if (status === 'UP') {
      if (openIncident) {
        // Il y avait un incident ouvert, on le résout
        await this.repository.resolveIncident(openIncident.id);
        this.logger.log(
          `Incident résolu pour service ${serviceId}`,
        );


        // Notifier la résolution
        await this.notifications.notifyAll({
          title: 'Incident résolu',
          message: `Le service ${service?.name} est de nouveau UP`,
        });
      }
      // Sinon : rien à faire, tout va bien
      return;
    }

    // CAS 2 : Le service est DOWN/TIMEOUT

    // Si un incident est déjà ouvert, on ne fait rien (pas de doublon)
    if (openIncident) return;

    // 1. D'abord compter les échecs
    const consecutiveFailures = await this.repository.countConsecutiveFailures(
      serviceId,
      failureThreshold,
    );

    // 2. Si seuil PAS atteint : on ne fait rien
    if (consecutiveFailures < failureThreshold) {
      return;
    }

    // 3. Seuil atteint : créer l'incident
    await this.repository.openIncident(serviceId, errorMessage);
    this.logger.warn(`🔴 Incident ouvert pour service ${serviceId}`);

    // 4. ET SEULEMENT MAINTENANT : notifier
    await this.notifications.notifyAll({
      title: '🔴 Incident détecté',
      message: `Le service ${service?.name ?? serviceId} est DOWN. Raison: ${errorMessage ?? 'Inconnue'}`,
    });
  }

  /**
   *  Récupère tous les incidents, avec leurs détails (service, timestamps, etc).
   * @returns  Une liste d'incidents.
   * @throws Error si la requête échoue.
   * 
   * Note : Cette méthode peut être utilisée pour afficher un tableau de bord des incidents.
   */
  async findAllIncidents() {
    return this.repository.findAllIncidents();
  }
}