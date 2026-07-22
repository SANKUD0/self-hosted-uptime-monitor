import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { Transporter } from 'nodemailer';
import { Notifier, NotificationPayload, ChannelNotifier } from '../../domain/notifier.interface';
import { ContactType } from '@prisma/client';

@Injectable()
export class EmailNotifier implements Notifier, ChannelNotifier, OnModuleInit {

  private readonly logger = new Logger(EmailNotifier.name);
  private transporter!: Transporter;

  readonly type = ContactType.EMAIL;

  async onModuleInit() {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT),
      secure: false, // STARTTLS over port 587
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
      },
    });

    // Validate SMTP connectivity at startup for fast feedback.
    try {
      await this.transporter.verify();
      this.logger.log('SMTP transporter ready');
    } catch (err) {
      this.logger.error('SMTP transporter initialization failed', err);
    }
  }

  async send(recipient: string, payload: NotificationPayload): Promise<void> {
    await this.transporter.sendMail({
      from: process.env.SMTP_FROM,
      to: recipient,
      subject: payload.title,
      text: payload.message,
    });
    this.logger.log(`Email sent to ${recipient}`);
  }

  async sendWithConfig(
    config: {
      smtpHost: string;
      smtpPort: number;
      smtpUsernameFrom: string;
      smtpPassword: string;
      recipientEmail: string;
    },
    payload: NotificationPayload,
  ): Promise<void> {
    const transporter = nodemailer.createTransport({
      host: config.smtpHost,
      port: config.smtpPort,
      secure: false, // STARTTLS over port 587
      auth: {
        user: config.smtpUsernameFrom,
        pass: config.smtpPassword,
      },
    });
    this.logger.debug(
      `SMTP test → host=${config.smtpHost} port=${config.smtpPort} user=${config.smtpUsernameFrom} passLen=${config.smtpPassword?.length}`
    );
    await transporter.sendMail({
      from: config.smtpUsernameFrom,
      to: config.recipientEmail,
      subject: payload.title,
      text: payload.message,
    });
    this.logger.log(`Test email sent to ${config.recipientEmail}`);
  }

  async sendFromConfig(config: unknown, payload: NotificationPayload): Promise<void> {
    await this.sendWithConfig(
      config as {
        smtpHost: string;
        smtpPort: number;
        smtpUsernameFrom: string;
        smtpPassword: string;
        recipientEmail: string;
      },
      payload,
    );
  }
}