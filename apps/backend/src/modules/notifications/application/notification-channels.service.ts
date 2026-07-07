import { BadGatewayException, Injectable } from "@nestjs/common";
import { NotificationChannelsRepository } from "../infrastructure/notification-channels.repository";
import { CreateNotificationChannelDto } from "./dto/create-notification-channel.dto";
import { Logger } from "@nestjs/common";
import { EmailNotifier } from "../infrastructure/notifiers/email.notifier";
import { DiscordNotifier } from "../infrastructure/notifiers/discord.notifier";
import { ContactType } from "@prisma/client";
import { ChannelNotifier } from "../domain/notifier.interface";

@Injectable()
export class NotificationChannelsService {
    private readonly logger = new Logger(NotificationChannelsService.name);
    private readonly notifiers: Map<ContactType, ChannelNotifier>;
    constructor(
        private readonly repository: NotificationChannelsRepository,
        emailNotifier: EmailNotifier,
        discordNotifier: DiscordNotifier,
    ) {
        this.notifiers = new Map(
            [emailNotifier, discordNotifier].map(n => [n.type, n]),
        );
    }

    /**
     * Creates a new notification channel.
     * @param dto The data transfer object containing the notification channel details.
     * @returns The created notification channel.
     */
    async create(dto: CreateNotificationChannelDto) {
        return await this.repository.create(dto);
    }
    /**
     * Updates an existing notification channel.
     * @param id The ID of the notification channel to update.
     * @param dto The data transfer object containing the updated notification channel details.
     * @returns The updated notification channel.
     */
    async update(id: string, dto: CreateNotificationChannelDto) {
        return await this.repository.update(id, dto);
    }
    /**
     * Removes a notification channel.
     * @param id The ID of the notification channel to remove.
     * @returns The removed notification channel.
     */
    async remove(id: string) {
        return await this.repository.remove(id);
    }
    /**
     * Retrieves a notification channel by its ID.
     * @param id The ID of the notification channel to retrieve.
     * @returns The notification channel with the specified ID.
     */
    async get(id: string) {
        return await this.repository.get(id);
    }
    /**
     * Retrieves all notification channels.
     * @returns An array of all notification channels.
     */
    async getAll() {
        return await this.repository.getAll();
    }
    /**
     * Tests a notification channel by sending a test notification.
     * @param dto The data transfer object containing the notification channel details.
     * @returns The result of the test notification.
     */
    async testNotification(id: string) {
        const channel = await this.repository.get(id);
        if (!channel) throw new Error(`Notification channel with ID ${id} not found.`);

        const notifier = this.notifiers.get(channel.type);
        if (!notifier) throw new Error(`No notifier found for type ${channel.type}`);

        const payload = {
            title: "Test Notification",
            message: "This is a test notification.",
        };

        try {
            await notifier.sendFromConfig(channel.config, payload);
        } catch (error) {
            this.logger.error(`Test notification failed for channel ${id}`, error);
            throw new BadGatewayException(`Test notification failed, Check your channel settings.`);
        }
    }

}