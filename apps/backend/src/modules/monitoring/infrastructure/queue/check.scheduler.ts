import { InjectQueue } from '@nestjs/bullmq';
import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { Queue } from 'bullmq';
import { PrismaService } from '../../../../shared/database/prisma.service';
import { CheckJobData } from './check.processor';

/**
 * Au démarrage de l'app, lit tous les services activés
 * et crée un job récurrent pour chacun selon leur intervalSeconds.
 */

// TODO: si dans service on change l'intervalSeconds, Timeout, failureThreshold, etc, il faudrait que le scheduler puisse mettre à jour le job récurrent correspondant (actuellement il ne gère que la création et la suppression de jobs). On peut faire ça en exposant une méthode publique updateSchedule(serviceId: string, newInterval: number) qui supprimerait l'ancien job et en recréerait un nouveau avec le nouvel intervalle.
@Injectable()
export class CheckScheduler implements OnModuleInit {
  private readonly logger = new Logger(CheckScheduler.name);

  constructor(
    @InjectQueue('checks') private readonly checksQueue: Queue,
    private readonly prisma: PrismaService,
  ) {}

  async onModuleInit() {
    this.logger.log('Initialisation du scheduler...');

    // 1. Nettoyer les anciens jobs récurrents (pour avoir un état propre)
    const repeatableJobs = await this.checksQueue.getRepeatableJobs();
    for (const job of repeatableJobs) {
      await this.checksQueue.removeRepeatableByKey(job.key);
    }
    this.logger.log(`${repeatableJobs.length} ancien(s) job(s) récurrent(s) supprimé(s).`);

    // 2. Lire tous les services activés
    const services = await this.prisma.service.findMany({
      where: { enabled: true },
    });

    // 3. Créer un job récurrent pour chaque service
    for (const service of services) {
      await this.scheduleService(service.id, service.intervalSeconds);
    }

    this.logger.log(`${services.length} service(s) programmé(s) pour monitoring.`);
  }

  /**
   * Crée un job récurrent pour un service donné.
   * Public pour pouvoir être appelée quand un nouveau service est créé.
   */
  async scheduleService(serviceId: string, intervalSeconds: number) {
    await this.checksQueue.add(
      'check',
      { serviceId } as CheckJobData,
      {
        repeat: { every: intervalSeconds * 1000 },
        jobId: `service-${serviceId}`, // ID unique pour éviter les doublons
        removeOnComplete: 100, // Garde les 100 derniers jobs complétés (debug)
        removeOnFail: 50,
      },
    );
    this.logger.log(`Service ${serviceId} programmé (toutes les ${intervalSeconds}s)`);
  }

  /**
   * Supprime le job récurrent d'un service.
   * À appeler quand un service est supprimé ou désactivé.
   */
  async unscheduleService(serviceId: string, intervalSeconds: number) {
    await this.checksQueue.removeRepeatable(
      'check',
      { every: intervalSeconds * 1000 },
      `service-${serviceId}`,
    );
    this.logger.log(`Service ${serviceId} désinscrit.`);
  }
}