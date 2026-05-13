import { Body, Controller, Delete, Get, Post, Put, Res, HttpException, HttpStatus, Patch, Query } from '@nestjs/common';
import { ServicesService } from '../applications/services.service';
import { CreateServiceDto } from '../applications/dto/create-services.dto';
import { UpdateServiceDto } from '../applications/dto/update-services.dto';

// TODO: async/await for all methods

@Controller('services')
export class ServicesController {
    constructor(private readonly servicesService: ServicesService) {}

    @Get()
    findAll() {
        return this.servicesService.findAll();
    }

    @Get(':id')
    getById(@Res() res, @Body() id: string) {
        const service = this.servicesService.getServiceById(id);
        if (!service) {
            throw new HttpException('Service not found', HttpStatus.NOT_FOUND);
        }
        return res.status(HttpStatus.OK).json(service);
    }

    @Get(':id/checks')
    getChecks(@Body('id') id: string) {
        return this.servicesService.getChecksById(id);
    }

    @Get(':id/incidents')
    async getIncidents(@Body('id') id: string) {
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
    updateService(@Body() dto: UpdateServiceDto, @Body('id') id: string) {
        try {
            if (!dto) throw new HttpException('Invalid request body', HttpStatus.BAD_REQUEST);
            return this.servicesService.updateService(dto, id);
        } catch (error) {
            throw new HttpException("Internal server error for updating service", HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

}
