import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/shared/database/prisma.service';
import { CreateServiceDto } from './dto/create-services.dto';
import { UpdateServiceDto } from './dto/update-services.dto';
import { ServicesRepository } from '../infrastructure/services.repository';

@Injectable()
export class ServicesService {
    constructor(
        private readonly servicesRepository: ServicesRepository
    ) { }

    findAll() {
        return this.servicesRepository.findAll();
    }

    insertNewService(dto: CreateServiceDto) {
        return this.servicesRepository.insertNewService(dto);
    }


    deleteService(id: string) {
        return this.servicesRepository.deleteService(id);
    }

    updateService(dto: UpdateServiceDto) {
        return this.servicesRepository.updateService(dto);
    }

    getServiceById(id: string) {
        return this.servicesRepository.getServiceById(id);
    }
}
