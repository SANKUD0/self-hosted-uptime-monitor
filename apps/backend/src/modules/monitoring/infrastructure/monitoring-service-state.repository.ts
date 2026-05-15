import { Injectable } from "@nestjs/common";
import { CheckStatus } from "@prisma/client";
import { PrismaService } from "src/shared/database/prisma.service";

@Injectable()
export class MonitoringServiceStateRepository {
    constructor(private readonly prisma: PrismaService) { }

    /**
     * Met à jour la latence d'un service après un check.
     * 
     * @param serviceId - ID du service à mettre à jour
     * @param latency - Nouvelle latence mesurée
     * @param timestamp - Date du check
     * @param latestCheckId - ID du check qui a généré cette latence
     * @return void
     * Note : on utilise une transaction même si ici c'est un seul update, pour garantir la cohérence si jamais on ajoute d'autres opérations liées à l'avenir (ex: logs, historique, etc).
    */
    async updateLatency(serviceId: string, latency: number | null, timestamp: Date, latestCheckId: string): Promise<void> {
        try {
            await this.prisma.$transaction(async (tx) => {
                // 1. Mettre à jour la latence du service
                await tx.serviceState.update({
                    where: { id: serviceId },
                    data: {
                        latencyMs: latency,
                        updatedAt: timestamp,
                        latestCheckId
                    },
                });
            });
        } catch (error) {
            console.error(`Erreur lors de la mise à jour de la latence pour le service ${serviceId}: ${new Date()}`, error);
        }
    }

    /**
     * Met à jour le statut d'un service après un check.
     * 
     * @param serviceId - ID du service à mettre à jour
     * @param status - Nouveau statut du service
     * @param statusCode - Code de statut HTTP ou interne
     * @param timestamp - Date du check
     * @param latestCheckId - ID du check qui a généré ce statut
     * @return void
     * Note : on utilise une transaction même si ici c'est un seul update, pour garantir la cohérence si jamais on ajoute d'autres opérations liées à l'avenir (ex: logs, historique, etc).
     */
    async updateStatus(serviceId: string, status: CheckStatus, statusCode: number, timestamp: Date, latestCheckId: string): Promise<void> {
        try {
            await this.prisma.$transaction(async (tx) => {
                // 1. Mettre à jour le statut du service
                await tx.serviceState.update({
                    where: { id: serviceId },
                    data: {
                        status: status,
                        statusCode: statusCode,
                        updatedAt: timestamp,
                        latestCheckId: latestCheckId
                    },
                });
            });
        } catch (error) {
            console.error(`Erreur lors de la mise à jour du statut pour le service ${serviceId}: ${new Date()}`, error);
        }
    }

    /**
     * Récupère l'état actuel d'un service (statut, latence, etc) pour affichage rapide 
     * @param serviceId - ID du service
     * @return ServiceState ou null si pas trouvé
     */
    async getSpecificServiceState(serviceId: string) {
        return await this.prisma.serviceState.findUnique({
            where: { id: serviceId },
            include: {
                service: {
                    select: {
                        name: true,
                        type: true,
                        target: true,
                    }
                }
            }
        });
    }

    /**
     *  Récupère l'état de tous les services 
     * @returns Une liste d'états de services.
     */
    async getAllServicesState() {
        return await this.prisma.serviceState.findMany({
            include: {
                service: {
                    select: {
                        name: true,
                        type: true,
                        target: true,
                    }
                }
            }
        });
    }
}