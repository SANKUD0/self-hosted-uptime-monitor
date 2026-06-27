import { Module } from '@nestjs/common';
import { NotificationsService } from './application/notifications.service';
import { UserContactsRepository } from './infrastructure/user-contacts.repository';
import { EmailNotifier } from './infrastructure/notifiers/email.notifier';
import { UserContactsController } from './presentation/user-contacts.controller';
import { DiscordNotifier } from './infrastructure/notifiers/discord.notifier';

@Module({
  controllers: [UserContactsController],
  providers: [
    NotificationsService,
    UserContactsRepository,
    EmailNotifier,
    DiscordNotifier
  ],
  exports: [NotificationsService], // Exported so IncidentsModule can dispatch notifications.
})
export class NotificationsModule {}