import { Module } from '@nestjs/common';
import { ServicesController } from './presentation/services.controller';
import { ServicesService } from './applications/services.service';

@Module({
  controllers: [ServicesController],
  providers: [ServicesService]
})
export class ServicesModule {}
