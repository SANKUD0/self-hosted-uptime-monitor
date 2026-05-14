import { Injectable, Logger } from '@nestjs/common';
import { CellphoneProvider } from '@prisma/client';
import { Notifier, NotificationPayload } from '../../domain/notifier.interface';
import { EmailNotifier } from './email.notifier';
import { smsToEmailAddress } from '../utils/sms-gateway';

/**
 * Envoie un SMS via la gateway email de l'opérateur canadien.
 * 
 * Le "recipient" est en fait une string au format "numero|operateur"
 * (ex: "5141234567|BELL") parce que l'interface Notifier ne prend qu'un
 * seul recipient string. On parse en interne.
 */
@Injectable()
export class SmsNotifier implements Notifier {
  private readonly logger = new Logger(SmsNotifier.name);

  constructor(private readonly emailNotifier: EmailNotifier) {}

  async send(recipient: string, payload: NotificationPayload): Promise<void> {
    // Format attendu : "phoneNumber|PROVIDER"
    const [phoneNumber, providerStr] = recipient.split('|');
    
    if (!phoneNumber || !providerStr) {
      throw new Error(`Recipient SMS invalide : "${recipient}". Format attendu : "numero|PROVIDER"`,);
    }

    const provider = providerStr as CellphoneProvider;
    const gatewayEmail = smsToEmailAddress(phoneNumber, provider);

    // SMS : préfixer le titre au début du message (les gateways ignorent souvent le subject)
    const smsPayload: NotificationPayload = {
      title: '', // Le subject est généralement ignoré pour les SMS
      message: `${payload.title}\n${payload.message}`,
    };

    await this.emailNotifier.send(gatewayEmail, smsPayload);
    this.logger.log(`SMS envoyé à ${phoneNumber} via ${provider}`);
  }
}