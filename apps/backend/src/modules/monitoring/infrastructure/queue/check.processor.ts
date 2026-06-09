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
    private readonly monitoringServiceStateRepository: MonitoringServiceStateRepository,
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

    // 4. Persist check result.
    await this.prisma.check.create({
      data: {
        serviceId: service.id,
        status: result.status,
        latencyMs: result.latencyMs,
        statusCode: result.statusCode,
        error: result.error,
      },
    });

    // Delegate incident state transitions to the incidents application service.
    await this.incidentsService.handleCheckResult(
      service.id,
      result.status,
      service.failureThreshold,
      result.error ?? null,
    );

    // 5. Update latest service projection (ServiceState) for dashboard reads.
    // Use a transaction to avoid concurrent projection update conflicts.
    await this.prisma.$transaction(async (tx) => {
      const currentStateService = await tx.serviceState.findUnique({
        where: { serviceId: service.id },
      });
      // Read latest check to detect no-op projection updates.
      const latestCheck = await tx.check.findFirst({
        where: { serviceId: service.id },
        orderBy: { timestamp: 'desc' },
      });

      if (latestCheck && currentStateService && latestCheck.id === currentStateService.latestCheckId) {
        // Avoid unnecessary writes when projection already reflects latest check.
        // Latency still gets refreshed for dashboard freshness.
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