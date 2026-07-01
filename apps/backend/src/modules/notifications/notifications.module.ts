import { Module } from '@nestjs/common';
import { NotificationsService } from './application/notifications.service';
import { UserContactsRepository } from './infrastructure/user-contacts.repository';
import { EmailNotifier } from './infrastructure/notifiers/email.notifier';
import { UserContactsController } from './presentation/user-contacts.controller';
import { DiscordNotifier } from './infrastructure/notifiers/discord.notifier';
import { NotificationsController } from './presentation/notifications.controller';
import { NotificationChannelsService } from './application/notification-channels.service';

@Module({
  controllers: [UserContactsController, NotificationsController],
  providers: [
    NotificationsService,
    NotificationChannelsService,
    UserContactsRepository,
    NotificationChannelsService,
    EmailNotifier,
    DiscordNotifier
  ],
  exports: [NotificationsService], // Exported so IncidentsModule can dispatch notifications.
})
export class NotificationsModule {}