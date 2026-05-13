import { Module } from '@nestjs/common';
import { IncidentsService } from './application/incidents.service';
import { IncidentsRepository } from './infrastructure/incidents.repository';

@Module({
  providers: [IncidentsService, IncidentsRepository],
  exports: [IncidentsService],
})
export class IncidentsModule {}