import { Module } from '@nestjs/common';
import { NotificationsService } from './application/notifications.service';
import { UserContactsRepository } from './infrastructure/user-contacts.repository';
import { EmailNotifier } from './infrastructure/notifiers/email.notifier';
import { SmsNotifier } from './infrastructure/notifiers/sms.notifier';
import { UserContactsController } from './presentation/user-contacts.controller';

@Module({
  controllers: [UserContactsController],
  providers: [
    NotificationsService,
    UserContactsRepository,
    EmailNotifier,
    SmsNotifier,
  ],
  exports: [NotificationsService], // Pour que IncidentsModule puisse l'utiliser
})
export class NotificationsModule {}