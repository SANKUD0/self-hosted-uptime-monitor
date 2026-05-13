import { Module } from '@nestjs/common';
import { IncidentsService } from './application/incidents.service';
import { IncidentsRepository } from './infrastructure/incidents.repository';
import { IncidentsController } from './presentation/incidents.controller';

@Module({
  controllers: [IncidentsController],
  providers: [IncidentsService, IncidentsRepository],
  exports: [IncidentsService],
})
export class IncidentsModule {}