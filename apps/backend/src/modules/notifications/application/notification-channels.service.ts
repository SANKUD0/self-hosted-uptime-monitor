import { Injectable } from "@nestjs/common";
import { NotificationChannelsRepository } from "../infrastructure/notification-channels.repository";
import { CreateNotificationChannelDto } from "./dto/create-notification-channel.dto";

@Injectable()
export class NotificationChannelsService {
    constructor(
        private readonly repository: NotificationChannelsRepository
    ) { }

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
}