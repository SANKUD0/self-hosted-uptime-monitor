import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../../shared/database/prisma.service";
import { CreateNotificationChannelDto } from "../application/dto/create-notification-channel.dto";

@Injectable()
export class NotificationChannelsRepository {
    constructor(private readonly prisma: PrismaService) { }

    /** Creates a new notification channel configuration in the database. */
    async create(dto: CreateNotificationChannelDto) {
        try {
            const created = await this.prisma.notificationChannelConfig.create({
                data: {
                    type: dto.data.type,
                    config: JSON.parse(JSON.stringify(dto.data)),
                }
            });
            return created;
        } catch (error) {
            console.error("Error creating notification channel configuration:", error);
            throw error;
        }
    }

    async update(id: string, dto: CreateNotificationChannelDto) {
        try {
            if (!id) throw new Error("ID is required for updating a notification channel configuration.");
            return await this.prisma.notificationChannelConfig.update({
                where: { id },
                data: {
                    type: dto.data.type,
                    config: JSON.parse(JSON.stringify(dto.data)),
                }
            })

        } catch (error) {
            console.error("Error updating notification channel configuration:", error);
            throw error;
        }
    }

    async remove(id: string) {
        try {
            if (!id) throw new Error("ID is required for removing a notification channel configuration.");
            return await this.prisma.notificationChannelConfig.delete({
                where: { id }
            });
        } catch (error) {
            console.error("Error removing notification channel configuration:", error);
            throw error;
        }
    }

    async get(id: string) {
        try {
            if (!id) throw new Error("ID is required for retrieving a notification channel configuration.");
            return await this.prisma.notificationChannelConfig.findUnique({
                where: { id }
            });
        } catch (error) {
            console.error("Error retrieving notification channel configuration:", error);
            throw error;
        }
    }

    async getAll() {
        try {
            return await this.prisma.notificationChannelConfig.findMany();
        } catch (error) {
            console.error("Error retrieving all notification channel configurations:", error);
            throw error;
        }
    }
}