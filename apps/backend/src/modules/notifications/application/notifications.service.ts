import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { UserContactsRepository } from '../infrastructure/user-contacts.repository';
import { EmailNotifier } from '../infrastructure/notifiers/email.notifier';
import { ChannelNotifier, NotificationPayload } from '../domain/notifier.interface';
import { CreateUserContactDto } from './dto/create-user-contact.dto';
import { UpdateUserContactDto } from './dto/update-user-contact.dto';
import { DiscordNotifier } from '../infrastructure/notifiers/discord.notifier';
import { NotificationChannelsRepository } from '../infrastructure/notification-channels.repository';
import { ContactType } from '@prisma/client';

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);
  private readonly notifiers: Map<ContactType, ChannelNotifier>;

  constructor(
    private readonly repository: UserContactsRepository,
    private readonly channelsRepository: NotificationChannelsRepository,
    private readonly emailNotifier: EmailNotifier,
    private readonly discordNotifier: DiscordNotifier
  ) {
    this.notifiers = new Map(
      [emailNotifier, discordNotifier].map((n) => [n.type, n]),
    )
  }

  // ============================================
  // UserContact CRUD
  // ============================================

  async findAll() {
    return await this.repository.findAll();
  }

  async findOne(id: string) {
    const contact = await this.repository.findById(id);
    if (!contact) {
      throw new NotFoundException(`Contact ${id} not found`);
    }
    return contact;
  }

  async create(dto: CreateUserContactDto) {
    return await this.repository.create({
      label: dto.label,
      type: dto.type,
      value: dto.value,
    });
  }

  async update(id: string, dto: UpdateUserContactDto) {
    await this.findOne(id); // throws 404 if not found
    return this.repository.update(id, dto);
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.repository.delete(id);
  }

  // ============================================
  // Notification dispatch
  // ============================================

  /**
   * Sends a notification to all enabled contacts.
   * Called by IncidentsService on incident open/resolve transitions.
   */
  async notifyAll(payload: NotificationPayload): Promise<void> {
    const channels = await this.channelsRepository.getAll();

    // Keep only channels the user has enabled in the settings UI.
    // `enabled` is stored inside the JSON `config` blob.
    // Can be refactored to a more elegant solution later, but this works for now.
    const enabledChannels = channels.filter((channel) => (channel.config as { enabled?: boolean })?.enabled === true,);

    this.logger.log(`Dispatching notification to ${enabledChannels.length} enabled channel(s)`,);

    await Promise.allSettled(
      enabledChannels.map((channel) => this.sendToChannel(channel, payload)),
    );
  }

  /**
   * Version 1
   * Old method to send notification to a specific contact. This is now deprecated.
   * Sends a notification to a specific contact.
   * Called by IncidentsService on incident open/resolve transitions.
   * @param contact - the contact to send the notification to
   * @param payload - the notification payload
   * @throws Error if the send fails
   */
  private async sendToContact(
    contact: {
      id: string;
      type: string;
      value: string;
    },
    payload: NotificationPayload,
  ): Promise<void> {
    try {
      if (contact.type === 'EMAIL') {
        await this.emailNotifier.send(contact.value, payload);
      } else if (contact.type === 'DISCORD') {
        // contact.value contains Discord webhook URL.
        await this.discordNotifier.send(contact.value, payload);
      }
    } catch (err) {
      this.logger.error(`Notification send failed for contact ${contact.id}`, err);
    }
  }

  /**
   * Version 2
   * New method to send notification to a specific channel. This is now the preferred method.
   * Sends a notification to a specific channel.
   * @param channel - the channel to send the notification to
   * @param payload - the notification payload
   * @returns Promise that resolves when the notification is sent
   */
  private async sendToChannel(
    channel: { id: string; type: ContactType; config: unknown },
    payload: NotificationPayload,
  ): Promise<void> {
    const notifier = this.notifiers.get(channel.type);
    if (!notifier) {
      this.logger.warn(`No notifier found for channel type [${channel.type}]`);
      return;
    }

    try {
      await notifier.sendFromConfig(channel.config, payload);
    } catch (error) {
      this.logger.error(` send failed for channel [${channel.id}] of type [${channel.type}]:`, error);
    }
  }

} 1