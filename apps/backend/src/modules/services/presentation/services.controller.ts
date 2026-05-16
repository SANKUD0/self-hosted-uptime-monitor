import { Body, Controller, Delete, Get, Post, Param, Res, HttpException, HttpStatus, Patch, Query } from '@nestjs/common';
import { ServicesService } from '../applications/services.service';
import { CreateServiceDto } from '../applications/dto/create-services.dto';
import { UpdateServiceDto } from '../applications/dto/update-services.dto';

// TODO: async/await for all methods

@Controller('services')
export class ServicesController {
    constructor(private readonly servicesService: ServicesService) { }

    @Get()
    findAll() {
        return this.servicesService.findAll();
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
    getById(@Param('id') id: string) {
        return this.servicesService.getServiceById(id);
    }

    @Get(':id/checks')
    getChecks(@Param('id') id: string) {
        return this.servicesService.getChecksById(id);
    }

    @Get(':id/incidents')
    async getIncidents(@Param('id') id: string) {
        return await this.servicesService.getIncidentsById(id);
    }

    @Post()
    create(@Body() dto: CreateServiceDto) {
        return this.servicesService.insertNewService(dto)
    }

    @Delete()
    delete(@Body() id: string) {
        return this.servicesService.deleteService(id);
    }

    @Patch(':id')
    updateService(@Param('id') id: string, @Body() dto: UpdateServiceDto) {
        try {
            if (!dto) throw new HttpException('Invalid request body', HttpStatus.BAD_REQUEST);
            return this.servicesService.updateService(dto, id);
        } catch (error) {
            throw new HttpException("Internal server error for updating service", HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

}
