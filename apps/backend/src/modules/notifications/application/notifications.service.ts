import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { UserContactsRepository } from '../infrastructure/user-contacts.repository';
import { EmailNotifier } from '../infrastructure/notifiers/email.notifier';
import { NotificationPayload } from '../domain/notifier.interface';
import { CreateUserContactDto } from './dto/create-user-contact.dto';
import { UpdateUserContactDto } from './dto/update-user-contact.dto';
import { DiscordNotifier } from '../infrastructure/notifiers/discord.notifier';

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(
    private readonly repository: UserContactsRepository,
    private readonly emailNotifier: EmailNotifier,
    private readonly discordNotifier: DiscordNotifier
  ) { }

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
    const contacts = await this.repository.findAllEnabled();

    this.logger.log(`Sending notifications to ${contacts.length} contact(s)`);

    await Promise.allSettled(
      contacts.map((contact) => this.sendToContact(contact, payload)),
    );
  }

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
}