import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { Transporter } from 'nodemailer';
import { Notifier, NotificationPayload } from '../../domain/notifier.interface';

@Injectable()
export class EmailNotifier implements Notifier, OnModuleInit {
  private readonly logger = new Logger(EmailNotifier.name);
  private transporter!: Transporter;

  async onModuleInit() {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT),
      secure: false, // STARTTLS sur 587
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
      },
    });

    // Vérifier la connexion au démarrage (pour détecter les erreurs vite)
    try {
      await this.transporter.verify();
      this.logger.log('SMTP transporter prêt');
    } catch (err) {
      this.logger.error('SMTP transporter en échec', err);
    }
  }

  async send(recipient: string, payload: NotificationPayload): Promise<void> {
    await this.transporter.sendMail({
      from: process.env.SMTP_FROM,
      to: recipient,
      subject: payload.title,
      text: payload.message,
    });
    this.logger.log(`Email envoyé à ${recipient}`);
  }
}