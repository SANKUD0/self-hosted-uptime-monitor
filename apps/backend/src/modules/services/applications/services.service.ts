import { Injectable } from '@nestjs/common';
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

    updateService(dto: UpdateServiceDto, id: string) {
        return this.servicesRepository.updateService(dto, id);
    }

    getServiceById(id: string) {
        return this.servicesRepository.getServiceById(id);
    }

    getCount() {
        return this.servicesRepository.getCount();
    }

    getUpServices() {
        return this.servicesRepository.getUpServices();
    }
    getDownServices() {
        return this.servicesRepository.getDownServices();
    }

    // checks
    getChecksById(id: string) {
        return this.servicesRepository.getChecksById(id);
    }


    // incidents
    async getIncidentsById(id: string) {
        return this.servicesRepository.getIncidentsById(id);
    }
}
