import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { HttpChecker } from './infrastructure/checkers/http.checker';
import { TcpChecker } from './infrastructure/checkers/tcp.checker';
import { PingChecker } from './infrastructure/checkers/ping.checker';
import { DockerChecker } from './infrastructure/checkers/docker.checker';
import { CheckProcessor } from './infrastructure/queue/check.processor';
import { CheckScheduler } from './infrastructure/queue/check.scheduler';
import { IncidentsModule } from '../incidents/incidents.module';
import { MonitoringServiceStateRepository } from './infrastructure/monitoring-service-state.repository';
import { MonitoringService } from './application/monitoring.service';
import { MonitoringController } from './presentation/monitoring.controller';
import { RealtimeModule } from '../realtime/realtime.module';

@Module({
  controllers: [MonitoringController],
  imports: [
    BullModule.registerQueue({
      name: 'checks',
    }),
    IncidentsModule,
    RealtimeModule
  ],
  providers: [
    HttpChecker,
    TcpChecker,
    PingChecker,
    DockerChecker,
    CheckProcessor,
    CheckScheduler,
    MonitoringServiceStateRepository,
    MonitoringService,
  ],
  exports: [CheckScheduler],
})
export class MonitoringModule {}