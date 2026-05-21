import { Injectable } from "@nestjs/common";
import { PrismaService } from "src/shared/database/prisma.service";
import { CreateServiceDto } from "../applications/dto/create-services.dto";
import { UpdateServiceDto } from "../applications/dto/update-services.dto";

@Injectable()
export class ServicesRepository {
    constructor(private readonly prisma: PrismaService) { }

    async findAll() {
        return await this.prisma.service.findMany({
            orderBy: { createdAt: 'desc' }
        });
    }

    async insertNewService(dto: CreateServiceDto) {
        try {
            return await this.prisma.service.create({
                data: dto
            });
        } catch (error) {
            console.log('Erreur lors de la création du service ', error);
            return { message: 'Erreur lors de la création du service' };
        }
    }

    async deleteService(id: string) {
        try {
            return await this.prisma.service.delete({
                where: { id: id}
            });
        } catch (error) {
            console.log('Erreur lors de la suppression du service:', error);
            return { message: 'Erreur lors de la suppression du service' };
        }
    }

    async updateService(dto: UpdateServiceDto, id: string) {
        try {
            if (!id) throw new Error('Service ID is required for update');
            return await this.prisma.service.update({
                where: { id },
                data: dto
            });
        } catch (error) {
            console.log('Erreur lors de la mise à jour du service:', error);
            return { message: 'Erreur lors de la mise à jour du service' };
        }
    }

    async getServiceById(id: string) {
        return await this.prisma.service.findUnique({
            where: { id }
        });
    }

    async getChecksById(id: string) {
        return await this.prisma.check.findMany({
            where: { serviceId: id }
        });
    }

    async getIncidentsById(id: string) {
        return this.prisma.incident.findMany({
            where: { serviceId: id }
        });
    }

    async getCount() {
        try {
            return await this.prisma.service.count();
        } catch (error) {
            console.log('Erreur lors de la récupération du nombre de services:', error);
            return null;
        }
    }

    async getUpServices() {
        return await this.prisma.serviceState.count({
            where: { status: 'UP' },
        });
    }

    async getDownServices() {
        return await this.prisma.serviceState.count({
            where: { status: 'DOWN' },
        });
    }

    async getServiceCardsInfo() {
        return await this.prisma.serviceState.findMany({
            select: {
                status: true,
                latencyMs: true,
                service: {
                    select: {
                        id: true,
                        name: true,
                        type: true,
                        intervalSeconds: true,
                    }
                }
            }
        });
    }
}