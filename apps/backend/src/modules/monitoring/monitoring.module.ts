import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { HttpChecker } from './infrastructure/checkers/http.checker';
import { TcpChecker } from './infrastructure/checkers/tcp.checker';
import { PingChecker } from './infrastructure/checkers/ping.checker';
import { DockerChecker } from './infrastructure/checkers/docker.checker';
import { CheckProcessor } from './infrastructure/queue/check.processor';
import { CheckScheduler } from './infrastructure/queue/check.scheduler';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'checks',
    }),
  ],
  providers: [
    HttpChecker,
    TcpChecker,
    PingChecker,
    DockerChecker,
    CheckProcessor,
    CheckScheduler,
  ],
})
export class MonitoringModule {}