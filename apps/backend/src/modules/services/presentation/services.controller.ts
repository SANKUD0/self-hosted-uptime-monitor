import { Body, Controller, Delete, Get, Post, Param, Res, HttpException, HttpStatus, Patch, Query } from '@nestjs/common';
import { ServicesService } from '../applications/services.service';
import { CreateServiceDto } from '../applications/dto/create-services.dto';
import { UpdateServiceDto } from '../applications/dto/update-services.dto';

@Controller('services')
export class ServicesController {
    constructor(private readonly servicesService: ServicesService) { }

    @Get()
    async findAll() {
        return await this.servicesService.findAll();
    }

    @Get('count')
    async getCount() {
        const count = await this.servicesService.getCount();
        return { count };
    }

    @Get('count/up')
    async getUpServices() {
        const upServices = await this.servicesService.getUpServices();
        return { upServices };
    }

    @Get('count/down')
    async getDownServices() {
        const downServices = await this.servicesService.getDownServices();
        return { downServices };
    }

    @Get(':id')
    async getById(@Param('id') id: string) {
        return await this.servicesService.getServiceById(id);
    }

    @Get(':id/checks')
    async getChecks(@Param('id') id: string) {
        return await this.servicesService.getChecksById(id);
    }

    @Get(':id/incidents')
    async getIncidents(@Param('id') id: string) {
        return await this.servicesService.getIncidentsById(id);
    }

    @Post()
    async create(@Body() dto: CreateServiceDto) {
        return await this.servicesService.insertNewService(dto);
    }

    @Delete(':id')
    async delete(@Param('id') id: string) {
        return await this.servicesService.deleteService(id);
    }

    @Patch(':id')
    async updateService(@Param('id') id: string, @Body() dto: UpdateServiceDto) {
        try {
            if (!dto) throw new HttpException('Invalid request body', HttpStatus.BAD_REQUEST);
            return await this.servicesService.updateService(dto, id);
        } catch (error) {
            throw new HttpException("Internal server error for updating service", HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @Patch(':id/enable-disable')
    async patchServiceStatus(@Param('id') id: string, @Body('enabled') enabled: boolean) {
        try {
            if (enabled === undefined) throw new HttpException('Invalid request body', HttpStatus.BAD_REQUEST);
            return await this.servicesService.patchServiceStatus(id, enabled);
        } catch (error) {
            throw new HttpException("Internal server error for updating service status", HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @Get('cards/info')
    async getServiceCardsInfo() {
        try {
            const info = await this.servicesService.getServiceCardsInfo();
            return info;
        } catch (error) {
            throw new HttpException("Internal server error for fetching service cards info", HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

}
