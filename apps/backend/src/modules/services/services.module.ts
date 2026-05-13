import { Module } from '@nestjs/common';
import { ServicesController } from './presentation/services.controller';
import { ServicesService } from './applications/services.service';
import { ServicesRepository } from './infrastructure/services.repository';

@Module({
  controllers: [ServicesController],
  providers: [ServicesService, ServicesRepository]
})
export class ServicesModule {}
