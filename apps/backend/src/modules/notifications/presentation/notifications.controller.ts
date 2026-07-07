import { Body, Controller, Delete, Get, Param, Patch, Post } from "@nestjs/common";
import { NotificationChannelsService } from "../application/notification-channels.service";
import { CreateNotificationChannelDto } from "../application/dto/create-notification-channel.dto";

@Controller('notifications')
export class NotificationsController {
    constructor(private readonly service: NotificationChannelsService){}

    /**
     * Creates a new notification channel.
     * @param dto The data transfer object containing the notification channel details.
     * @returns The created notification channel.
     */
    @Post()
    createChannels(@Body() dto: CreateNotificationChannelDto) {
        return this.service.create(dto);
    }
    /**
     * Updates an existing notification channel.
     * @param id The ID of the notification channel to update.
     * @param dto The data transfer object containing the updated notification channel details.
     * @returns The updated notification channel.
     */
    @Patch(':id')
    updateChannels(@Param('id') id: string, @Body() dto: CreateNotificationChannelDto) {
        return this.service.update(id, dto);
    }
    /**
     * Retrieves a notification channel by its ID.
     * @param id The ID of the notification channel to retrieve.
     * @returns The notification channel with the specified ID.
     */
    @Get(':id')
    getChannel(@Param('id') id: string) {
        return this.service.get(id);
    }
    @Get()
    GetChannels() {
        return this.service.getAll();
    }
    /**
     * Removes a notification channel by its ID.
     * @param id The ID of the notification channel to remove.
     * @returns The removed notification channel.
     */
    @Delete(':id')
    deleteChannels(@Param('id') id: string) {
        return this.service.remove(id);
    }
    /**
     * Tests a notification channel by sending a test notification.
     * @param id The ID of the notification channel to test.
     * @returns The result of the test notification.
     */
    @Post(':id/test')
    testNotification(@Param('id') id: string) {
        return this.service.testNotification(id);
    }
} 