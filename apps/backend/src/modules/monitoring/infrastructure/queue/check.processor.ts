import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { PrismaService } from '../../../../shared/database/prisma.service';
import { HttpChecker } from '../checkers/http.checker';
import { TcpChecker } from '../checkers/tcp.checker';
import { PingChecker } from '../checkers/ping.checker';
import { DockerChecker } from '../checkers/docker.checker';
import { Checker } from '../../domain/checker.interface';
import { ServiceType } from '@prisma/client';
import { IncidentsService } from '../../../incidents/application/incidents.service';
import { MonitoringServiceStateRepository } from '../monitoring-service-state.repository';

/**
 * Données passées au job
 */
export interface CheckJobData {
  serviceId: string;
}

/**
 * Le worker qui exécute les checks.
 * 
 * Pour chaque job dans la queue "checks":
 * 1. Charge le service depuis la DB
 * 2. Choisit le bon checker selon service.type (pattern Strategy)
 * 3. Exécute le check
 * 4. Sauvegarde le résultat dans la table Check
 */
@Processor('checks')
export class CheckProcessor extends WorkerHost {
  private readonly logger = new Logger(CheckProcessor.name);
  private readonly checkers: Record<ServiceType, Checker>;

  constructor(
    private readonly prisma: PrismaService,
    private readonly httpChecker: HttpChecker,
    private readonly tcpChecker: TcpChecker,
    private readonly pingChecker: PingChecker,
    private readonly dockerChecker: DockerChecker,
    private readonly incidentsService: IncidentsService,
    private readonly monitoringServiceStateRepository: MonitoringServiceStateRepository,
  ) {
    super();
    // On mappe chaque type vers son checker (pattern Strategy)
    this.checkers = {
      HTTP: httpChecker,
      TCP: tcpChecker,
      PING: pingChecker,
      DOCKER: dockerChecker,
    };
  }

  async process(job: Job<CheckJobData>): Promise<void> {
    const { serviceId } = job.data;

    // 1. Charger le service depuis la DB
    const service = await this.prisma.service.findUnique({
      where: { id: serviceId },
    });

    if (!service) {
      this.logger.warn(`Service ${serviceId} introuvable, skip.`);
      return;
    }

    // Si le service a été désactivé entre-temps, on skip
    if (!service.enabled) {
      this.logger.debug(`Service ${service.name} désactivé, skip.`);
      return;
    }

    // 2. Choisir le bon checker (pattern Strategy)
    const checker = this.checkers[service.type];

    // 3. Exécuter le check
    const result = await checker.check(service.target, service.timeoutMs);

    this.logger.log(
      `[${service.name}] ${result.status} - ${result.latencyMs}ms`,
    );

    // 4. Sauvegarder le résultat
    await this.prisma.check.create({
      data: {
        serviceId: service.id,
        status: result.status,
        latencyMs: result.latencyMs,
        statusCode: result.statusCode,
        error: result.error,
      },
    });

    // Déléguer la logique d'incidents
    await this.incidentsService.handleCheckResult(
      service.id,
      result.status,
      service.failureThreshold,
      result.error ?? null,
    );

    // 5. Mettre à jour le dernier état du service (UP/DOWN) pour affichage rapide
    // Transaction pour éviter les conflits de mise à jour concurrente entre le CheckProcessor et la route GET /services/:id qui lit aussi ServiceState
    await this.prisma.$transaction(async (tx) => {
      const currentStateService = await tx.serviceState.findUnique({
        where: { serviceId: service.id },
      });
      // Chercher le check le plus récent pour voir si serviceState et check son identiques, si oui on fait rien, sinon on met à jour le serviceState
      const latestCheck = await tx.check.findFirst({
        where: { serviceId: service.id },
        orderBy: { timestamp: 'desc' },
      });

      if (latestCheck && currentStateService && latestCheck.id === currentStateService.latestCheckId) {
        // Si rien n'a changé depuis le dernier check, on ne met pas à jour le serviceState pour éviter les écritures inutiles
        // Cependant, on met à jour la latence même si le statut n'a pas changé, pour avoir des données de latence à jour dans le dashboard
        this.monitoringServiceStateRepository.updateLatency(service.id, latestCheck.latencyMs, new Date(), latestCheck.id);
        return;
      }

      if (currentStateService) {
        await tx.serviceState.update({
          where: { serviceId: service.id },
          data: {
            status: result.status,
            latestCheckId: latestCheck?.id,
            latencyMs: result.latencyMs,
            statusCode: result.statusCode ?? null,
            error: result.error ?? null,
          },
        });
      } else {
        await tx.serviceState.create({
          data: {
            service: { connect: { id: service.id } },
            status: result.status,
            latencyMs: result.latencyMs,
            statusCode: result.statusCode,
            error: result.error,
            latestCheckId: latestCheck?.id,
          },
        });
      }
    });
  }
}