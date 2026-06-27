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

    async findAll() {
        return await this.servicesRepository.findAll();
    }

    async insertNewService(dto: CreateServiceDto) {
        const service = await this.servicesRepository.insertNewService(dto);
        if (service && 'id' in service && service.enabled !== false) {
            await this.checkScheduler.scheduleService(service.id, service.intervalSeconds);
            await this.checkScheduler.runImmediateCheck(service.id);
        }
        return service;
    }


    async deleteService(id: string) {
        return await this.servicesRepository.deleteService(id);
    }

    async updateService(dto: UpdateServiceDto, id: string) {
        return await this.servicesRepository.updateService(dto, id);
    }

    async getServiceById(id: string) {
        return await this.servicesRepository.getServiceById(id);
    }

    async getCount() {
        return await this.servicesRepository.getCount();
    }

    async getUpServices() {
        return await this.servicesRepository.getUpServices();
    }

    async getDownServices() {
        return await this.servicesRepository.getDownServices();
    }

    async getServiceCardsInfo() {
        return await this.servicesRepository.getServiceCardsInfo();
    }

    /**
     * Enables or disables a service and schedules/unschedules checks accordingly.
     * To be called when a service's enabled status is toggled.
     */
    async patchServiceStatus(id: string, enabled: boolean) {
        const service = await this.servicesRepository.patchServiceEnabled(id, enabled);
        // If the service was successfully updated and has an ID, schedule or unschedule checks based on the new status
        if (service && 'id' in service) {
            if (enabled) {
                // If the service is now enabled, schedule checks
                await this.checkScheduler.scheduleService(service.id, service.intervalSeconds);
                await this.checkScheduler.runImmediateCheck(service.id);
            } else {
                // If the service is now disabled, unschedule checks
                await this.checkScheduler.unscheduleService(service.id, service.intervalSeconds);
            }
        }
        return service;
    }

    // checks
    async getChecksById(id: string) {
        return await this.servicesRepository.getChecksById(id);
    }

    // incidents
    async getIncidentsById(id: string) {
        return await this.servicesRepository.getIncidentsById(id);
    }
}
