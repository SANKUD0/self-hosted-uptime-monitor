import { InjectQueue } from '@nestjs/bullmq';
import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { Queue } from 'bullmq';
import { PrismaService } from '../../../../shared/database/prisma.service';
import { CheckJobData } from './check.processor';

/**
 * On application startup, reads all enabled services and registers
 * one repeatable monitoring job per service using its intervalSeconds.
 */

// TODO: if intervalSeconds, timeoutMs, or failureThreshold changes on a service,
// the scheduler should update the corresponding repeatable job. Expose a public
// updateSchedule(serviceId: string, newInterval: number) method that removes the
// previous job and re-registers it with the new interval.
@Injectable()
export class CheckScheduler implements OnModuleInit {
  private readonly logger = new Logger(CheckScheduler.name);

  constructor(
    @InjectQueue('checks') private readonly checksQueue: Queue,
    private readonly prisma: PrismaService,
  ) {}

  async onModuleInit() {
    this.logger.log('Initializing scheduler...');

    // 1. Clean up old repeatable jobs (to have a clean state at startup)
    const repeatableJobs = await this.checksQueue.getRepeatableJobs();
    for (const job of repeatableJobs) {
      await this.checksQueue.removeRepeatableByKey(job.key);
    }
    this.logger.log(`${repeatableJobs.length} old repeatable job(s) removed.`);

    // 2. Read all enabled services from the database
    const services = await this.prisma.service.findMany({
      where: { enabled: true },
    });

    // 3. Create a repeatable job for each service
    for (const service of services) {
      await this.scheduleService(service.id, service.intervalSeconds);
    }

    this.logger.log(`${services.length} service(s) scheduled for monitoring.`);
  }

  /**
   * Creates a repeatable job for a given service.
   * Public to be called when a new service is created.
   */
  async scheduleService(serviceId: string, intervalSeconds: number) {
    await this.checksQueue.add(
      'check',
      { serviceId } as CheckJobData,
      {
        repeat: { every: intervalSeconds * 1000 },
        jobId: `service-${serviceId}`, // Unique ID to avoid duplicates
        removeOnComplete: 100, // Keep the last 100 completed jobs (for debugging)
        removeOnFail: 50,
      },
    );
    this.logger.log(`Service ${serviceId} scheduled (every ${intervalSeconds}s)`);
  }

  /**
   * Triggers a one-time immediate check for a service.
   * To be called right after a service is created to get an initial result quickly.
   */
  async runImmediateCheck(serviceId: string) {
    await this.checksQueue.add(
      'check',
      { serviceId } as CheckJobData,
      {
        removeOnComplete: true,
        removeOnFail: 50,
      },
    );
    this.logger.log(`Immediate check triggered for service ${serviceId}`);
  }

  /**
   * Removes the repeatable job for a service.
   * To be called when a service is deleted or disabled.
   */
  async unscheduleService(serviceId: string, intervalSeconds: number) {
    await this.checksQueue.removeRepeatable(
      'check',
      { every: intervalSeconds * 1000 },
      `service-${serviceId}`,
    );
    this.logger.log(`Service ${serviceId} unscheduled.`);
  }
}