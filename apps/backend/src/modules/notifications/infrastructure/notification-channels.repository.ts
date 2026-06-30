import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../../shared/database/prisma.service";
import { CreateNotificationChannelDto } from "../application/dto/create-notification-channel.dto";

@Injectable()
export class NotificationChannelsRepository {
    constructor(private readonly prisma: PrismaService) { }

    /** Creates a new notification channel configuration in the database. */
    async create(dto: CreateNotificationChannelDto) {
        try {
            return await this.prisma.notificationChannelConfig.create({
                data: {
                    type: dto.data.type,
                    config: JSON.parse(JSON.stringify(dto.data)),
                    createdAt: new Date(),
                }
            })
        } catch (error) {
            console.error("Error creating notification channel configuration:", error);
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
        }
    }
}