import { Module } from '@nestjs/common';
import { RealtimeGateway } from './infrastructure/realtime.gateway';
import { RealtimeService } from './application/realtime.service';

@Module({
  providers: [RealtimeGateway, RealtimeService],
  exports: [RealtimeService],
})
export class RealtimeModule {}