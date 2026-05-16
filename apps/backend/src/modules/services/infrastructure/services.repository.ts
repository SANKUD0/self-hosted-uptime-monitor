import { Injectable } from "@nestjs/common";
import { PrismaService } from "src/shared/database/prisma.service";
import { CreateServiceDto } from "../applications/dto/create-services.dto";
import { UpdateServiceDto } from "../applications/dto/update-services.dto";

@Injectable()
export class ServicesRepository {
    constructor(private readonly prisma: PrismaService) { }

      findAll() {
        return this.prisma.service.findMany({
            orderBy: { createdAt: 'desc' }
        });
    }

    insertNewService(dto: CreateServiceDto) {
        try {
            return this.prisma.service.create({
                data: dto
            });
        } catch (error) {
            console.log('Erreur lors de la création du service ', error);
            return { message: 'Erreur lors de la création du service' };
        }
    }

    deleteService(id: string) {
        try {
            return this.prisma.service.delete({
                where: { id }
            });
        } catch (error) {
            console.log('Erreur lors de la suppression du service:', error);
            return { message: 'Erreur lors de la suppression du service' };
        }
    }

    updateService(dto: UpdateServiceDto, id: string) {
        try {
            if (!id) throw new Error('Service ID is required for update');
            return this.prisma.service.update({
                where: { id },
                data: dto
            });
        } catch (error) {
            console.log('Erreur lors de la mise à jour du service:', error);
            return { message: 'Erreur lors de la mise à jour du service' };
        }
    }

    getServiceById(id: string) {
        return this.prisma.service.findUnique({
            where: { id }
        });
    }

    getChecksById(id: string) {
        return this.prisma.check.findMany({
            where: { serviceId: id }
        });
    }

    async getIncidentsById(id: string) {
        return this.prisma.incident.findMany({
            where: { serviceId: id }
        });
    }

    getCount() {
        try {
            return this.prisma.service.count();
        } catch (error) {
            console.log('Erreur lors de la récupération du nombre de services:', error);
            return null; // ou une valeur par défaut appropriée
        }
    }

    getUpServices() {
        return this.prisma.serviceState.count({
            where: { status: 'UP' },
        });
    }

    getDownServices() {
        return this.prisma.serviceState.count({
            where: { status: 'DOWN' },
        });
    }
}