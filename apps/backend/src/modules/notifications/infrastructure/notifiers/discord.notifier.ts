import { Injectable, Logger } from '@nestjs/common';
import { Notifier, NotificationPayload } from '../../domain/notifier.interface';
import { ContactType } from '@prisma/client';

@Injectable()
export class DiscordNotifier implements Notifier {
  private readonly logger = new Logger(DiscordNotifier.name);

  readonly type = ContactType.DISCORD;

  async send(recipient: string, payload: NotificationPayload): Promise<void> {
    const isAlert =
      payload.title.includes('🔴') ||
      payload.title.toLowerCase().includes('détect');
    const color = isAlert ? 0xff0000 : 0x00ff00;

    const response = await fetch(recipient, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: 'OpenNotify',
        // Optional plain content above embeds (for mentions such as @everyone).
        embeds: [
          {
            title: payload.title,
            description: payload.message,
            color: color,
            timestamp: new Date().toISOString(),
          },
        ],
        // content: isAlert ? '@everyone' : undefined,
        // // IMPORTANT: allow @everyone mentions from this webhook.
        // allowed_mentions: {
        //   parse: ['everyone'],
        // },
      }),
    });

    if (!response.ok) {
      throw new Error(
        `Discord webhook failed: ${response.status} ${response.statusText}`,
      );
    }

    this.logger.log('Discord notification sent');
  }

  async sendFromConfig(config: unknown, payload: NotificationPayload): Promise<void> {
    const {webhookUrl} = config as {webhookUrl: string};
    await this.send(webhookUrl, payload);
  }
}