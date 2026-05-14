import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { UserContactsRepository } from '../infrastructure/user-contacts.repository';
import { EmailNotifier } from '../infrastructure/notifiers/email.notifier';
import { SmsNotifier } from '../infrastructure/notifiers/sms.notifier';
import { NotificationPayload } from '../domain/notifier.interface';
import { CreateUserContactDto } from './dto/create-user-contact.dto';
import { UpdateUserContactDto } from './dto/update-user-contact.dto';

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(
    private readonly repository: UserContactsRepository,
    private readonly emailNotifier: EmailNotifier,
    private readonly smsNotifier: SmsNotifier,
  ) {}

  // ============================================
  // CRUD pour les UserContact
  // ============================================

  findAll() {
    return this.repository.findAll();
  }

  async findOne(id: string) {
    const contact = await this.repository.findById(id);
    if (!contact) {
      throw new NotFoundException(`Contact ${id} introuvable`);
    }
    return contact;
  }

  create(dto: CreateUserContactDto) {
    // Validation : si SMS, provider obligatoire
    if (dto.type === 'SMS' && !dto.provider) {
      throw new Error('Le provider est obligatoire pour un contact SMS');
    }
    return this.repository.create({
      label: dto.label,
      type: dto.type,
      value: dto.value,
      provider: dto.provider ?? null,
    });
  }

  async update(id: string, dto: UpdateUserContactDto) {
    await this.findOne(id); // throw 404 si introuvable
    return this.repository.update(id, dto);
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.repository.delete(id);
  }

  // ============================================
  // Envoi de notifications
  // ============================================

  /**
   * Envoie une notification à tous les contacts activés.
   * Appelé depuis IncidentsService quand un incident est ouvert/résolu.
   */
  async notifyAll(payload: NotificationPayload): Promise<void> {
    const contacts = await this.repository.findAllEnabled();
    
    this.logger.log(`Envoi de notif à ${contacts.length} contact(s)`);

    await Promise.allSettled(
      contacts.map((contact) => this.sendToContact(contact, payload)),
    );
  }

  private async sendToContact(
    contact: {
      id: string;
      type: string;
      value: string;
      provider: string | null;
    },
    payload: NotificationPayload,
  ): Promise<void> {
    try {
      if (contact.type === 'EMAIL') {
        await this.emailNotifier.send(contact.value, payload);
      } else if (contact.type === 'SMS') {
        if (!contact.provider) {
          this.logger.warn(`Contact SMS ${contact.id} sans provider, skip`);
          return;
        }
        const recipient = `${contact.value}|${contact.provider}`;
        await this.smsNotifier.send(recipient, payload);
      }
    } catch (err) {
      this.logger.error(`Erreur d'envoi pour contact ${contact.id}`, err);
    }
  }
}