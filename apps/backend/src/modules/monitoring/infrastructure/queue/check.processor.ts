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
import { RealtimeService } from '../../../realtime/application/realtime.service';

/**
 * Payload sent to BullMQ check jobs.
 */
export interface CheckJobData {
  serviceId: string;
}

/**
 * Worker responsible for executing health checks.
 *
 * For each job in the "checks" queue:
 * 1. Load service configuration from the database
 * 2. Pick checker strategy based on service type
 * 3. Execute the check
 * 4. Persist result in the Check table
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
    // private readonly monitoringServiceStateRepository: MonitoringServiceStateRepository,
    private readonly realtimeService: RealtimeService,
  ) {
    super();
    // Map each service type to its checker implementation (Strategy pattern).
    this.checkers = {
      HTTP: httpChecker,
      TCP: tcpChecker,
      PING: pingChecker,
      DOCKER: dockerChecker,
    };
  }

  async process(job: Job<CheckJobData>): Promise<void> {
    const { serviceId } = job.data;


    // 1. Load service configuration from the database.
    const service = await this.prisma.service.findUnique({
      where: { id: serviceId },
    });

    if (!service) {
      this.logger.warn(`Service ${serviceId} not found, skipping check.`);
      return;
    }

    // Skip if the service was disabled after scheduling but before execution.
    if (!service.enabled) {
      this.logger.debug(`Service ${service.name} is disabled, skipping check.`);
      return;
    }

    // 2. Resolve checker implementation (Strategy pattern).
    const checker = this.checkers[service.type];

    // 3. Execute health check.
    const result = await checker.check(service.target, service.timeoutMs);

    this.logger.log(
      `[${service.name}] ${result.status} - ${result.latencyMs}ms`,
    );

    /**
     * 4. Persist check result only if the status is not UP.
     * This avoids unnecessary writes for healthy services, which are the majority.
     * The latest check is still reflected in the ServiceState projection for dashboard reads.
     */
    if (result.status !== 'UP') {
      await this.prisma.check.create({
        data: {
          serviceId: service.id,
          status: result.status,
          latencyMs: result.latencyMs,
          statusCode: result.statusCode,
          error: result.error,
        },
      });
    }

    // Delegate incident state transitions to the incidents application service.
    await this.incidentsService.handleCheckResult(
      service.id,
      result.status,
      service.failureThreshold,
      result.error ?? null,
    );

    // 5. Update latest service projection (ServiceState) for dashboard reads.

    // Note: this is old code that was commented out in favor of a simpler upsert approach. 
    // Due to the use of the websocket for real-time updates, we can avoid the complexity of transactions and just upsert the latest state.

    // Use a transaction to avoid concurrent projection update conflicts.
    // await this.prisma.$transaction(async (tx) => {
    //   const currentStateService = await tx.serviceState.findUnique({
    //     where: { serviceId: service.id },
    //   });
    //   // Read latest check to detect no-op projection updates.
    //   const latestCheck = await tx.check.findFirst({
    //     where: { serviceId: service.id },
    //     orderBy: { timestamp: 'desc' },
    //   });

    //   if (latestCheck && currentStateService && latestCheck.id === currentStateService.latestCheckId) {
    //     // Avoid unnecessary writes when projection already reflects latest check.
    //     // Latency still gets refreshed for dashboard freshness.
    //     this.monitoringServiceStateRepository.updateLatency(service.id, latestCheck.latencyMs, new Date(), latestCheck.id);
    //     return;
    //   }

    //   if (currentStateService) {
    //     await tx.serviceState.update({
    //       where: { serviceId: service.id },
    //       data: {
    //         status: result.status,
    //         latestCheckId: latestCheck?.id,
    //         latencyMs: result.latencyMs,
    //         statusCode: result.statusCode ?? null,
    //         error: result.error ?? null,
    //       },
    //     });
    //   } else {
    //     await tx.serviceState.create({
    //       data: {
    //         service: { connect: { id: service.id } },
    //         status: result.status,
    //         latencyMs: result.latencyMs,
    //         statusCode: result.statusCode,
    //         error: result.error,
    //         latestCheckId: latestCheck?.id,
    //       },
    //     });
    //   }
    // });

    await this.prisma.serviceState.upsert({
      where: { serviceId: service.id },
      update: {
        status: result.status,
        latencyMs: result.latencyMs,
        statusCode: result.statusCode ?? null,
        error: result.error ?? null,
        updatedAt: new Date(),
      },
      create: {
        service: { connect: { id: service.id } },
        status: result.status,
        latencyMs: result.latencyMs,
        statusCode: result.statusCode,
        error: result.error,
      },
    });

    // 6. Broadcast real-time events
    await this.broadcastPostCheckEvent(service.id, service);
  }

  private async broadcastPostCheckEvent(
    serviceId: string,
    service: { name: string; type: ServiceType; target: string; enabled: boolean; },
  ): Promise<void> {
    try {
      // Fetch the latest state of the service after the check.
      const updatedState = await this.prisma.serviceState.findUnique({
        where: { serviceId },
      });

      /**
       * Broadcast the updated service state to all connected clients.
       * This allows the front-end to update the dashboard in real-time without polling.
       * The event includes the service's name, type, target, enabled status, and the latest check result.
       * The timestamp is converted to ISO string for consistent formatting across clients.
       */
      if (updatedState) {
        this.realtimeService.broadcastMonitoringUpdate(
          {
            id: updatedState.id,
            service: {
              name: service.name,
              type: service.type,
              target: service.target,
              enabled: service.enabled,
            },
            status: updatedState.status,
            statusCode: updatedState.statusCode,
            latencyMs: updatedState.latencyMs,
            error: updatedState.error,
            updatedAt: updatedState.updatedAt.toISOString(),
          }
        );
      }

      /**
       * Broadcast summary metrics to all connected clients.
       * This includes total enabled services, number of services currently UP, and number of open incidents.
       * These metrics are useful for dashboard summary cards and overall system health visibility.
       */
      const [totalServices, upServices, openIncidents] = await Promise.all([
        this.prisma.service.count({ where: { enabled: true } }),
        this.prisma.serviceState.count({ where: { status: 'UP' } }),
        this.prisma.incident.count({ where: { resolvedAt: null } }),
      ]);

      this.realtimeService.broadcastStatsUpdate({
        totalServices,
        upServices,
        downServices: totalServices - upServices, // Calculate down services as total minus up.
        openIncidents,
      });

    } catch (err) {
      this.logger.error('Failed to broadcast post-check event', err);
    }
  }
}