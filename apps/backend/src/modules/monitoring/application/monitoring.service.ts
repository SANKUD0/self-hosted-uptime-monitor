import { Injectable } from "@nestjs/common";
import { MonitoringServiceStateRepository } from "../infrastructure/monitoring-service-state.repository";

@Injectable()
export class MonitoringService {
    constructor(
        private readonly monitoringServiceStateRepository: MonitoringServiceStateRepository,
    ) {}

    async getServiceState() {
        return await this.monitoringServiceStateRepository.getAllServicesState();
    }

    async getSpecificServiceState(serviceId: string) {
        return await this.monitoringServiceStateRepository.getSpecificServiceState(serviceId);
    }
}