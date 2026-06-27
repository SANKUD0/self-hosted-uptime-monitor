import { Body, Controller, Get, Param, Patch } from "@nestjs/common";
import { IncidentsService } from "../application/incidents.service";

@Controller('incidents')
export class IncidentsController {
    constructor(private readonly incidentsService: IncidentsService) { }

    @Get()
    async getAllIncidents() {
        try {
            const incidents = await this.incidentsService.findAllIncidents();
            return incidents;
        } catch (error) {
            throw new Error(`Failed to fetch incidents: ${error}`);
        }
    }

    @Get('count/open')
    async getIncidentsCountOpen() {
        try {
            const count = await this.incidentsService.getIncidentsCountOpen();
            return { count };
        } catch (error) {
            throw new Error(`Failed to fetch incidents count: ${error}`);
        }
    }

    @Patch(':id/resolve')
    async resolveIncident(@Param('id') id: string, @Body() body: { rootCause: string }) {
        try {
            const resolvedIncident = await this.incidentsService.resolveIncident(id, body.rootCause);
            return resolvedIncident;
        } catch (error) {
            throw new Error(`Failed to resolve incident with id ${id}: ${error}`);
        }
    }

}