import { Controller, Get, Param } from "@nestjs/common";
import { MonitoringService } from "../application/monitoring.service";

@Controller('monitoring')
export class MonitoringController {
    constructor(
        private readonly monitoringService: MonitoringService,
    ) { }

    @Get()
    async getAllServicesState() {
        return await this.monitoringService.getServiceState();
    }

    @Get(':id')
    async getSpecificServiceState(@Param('id') id: string) {
        return await this.monitoringService.getSpecificServiceState(id);
    }

    @Get(':id/checks')
    async get5firstRecentChecksForService(@Param('id') id: string) {
        return await this.monitoringService.get5firstRecentChecksForService(id);
    }
}