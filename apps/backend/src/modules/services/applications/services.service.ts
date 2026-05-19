import { Injectable } from '@nestjs/common';
import { CreateServiceDto } from './dto/create-services.dto';
import { UpdateServiceDto } from './dto/update-services.dto';
import { ServicesRepository } from '../infrastructure/services.repository';
import { CheckScheduler } from '../../monitoring/infrastructure/queue/check.scheduler';

@Injectable()
export class ServicesService {
    constructor(
        private readonly servicesRepository: ServicesRepository,
        private readonly checkScheduler: CheckScheduler,
    ) { }

    findAll() {
        return this.servicesRepository.findAll();
    }

    async insertNewService(dto: CreateServiceDto) {
        const service = await this.servicesRepository.insertNewService(dto);
        if (service && 'id' in service && service.enabled !== false) {
            await this.checkScheduler.scheduleService(service.id, service.intervalSeconds);
            await this.checkScheduler.runImmediateCheck(service.id);
        }
        return service;
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

    getServiceCardsInfo() {
        return this.servicesRepository.getServiceCardsInfo();
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
