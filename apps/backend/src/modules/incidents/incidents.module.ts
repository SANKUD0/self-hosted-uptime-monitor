import { Module } from '@nestjs/common';
import { IncidentsService } from './application/incidents.service';
import { IncidentsRepository } from './infrastructure/incidents.repository';
import { IncidentsController } from './presentation/incidents.controller';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [NotificationsModule],
  controllers: [IncidentsController],
  providers: [IncidentsService, IncidentsRepository],
  exports: [IncidentsService],
})
export class IncidentsModule {}