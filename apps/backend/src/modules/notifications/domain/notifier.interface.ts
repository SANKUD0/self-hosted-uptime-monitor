import { ContactType } from "@prisma/client";

/**
 * Payload of a notification to be sent.
 */
export interface NotificationPayload {
  title: string;
  message: string;
}

/**
 * Interface that all notifiers must implement.
 * Strategy Pattern: allows having EmailNotifier, SmsNotifier, etc.
 */
export interface Notifier {
  /**
   * Send a notification to a recipient using the notifier's configuration.
   * 
   * @param recipient - the recipient's address (e.g., email for EmailNotifier, phone number for SmsNotifier)
   * @param payload - the notification content
   * @throws Error if sending fails
   */
  send(recipient: string, payload: NotificationPayload): Promise<void>;

}

export interface ChannelNotifier {
  /** The type of contact this notifier handles (e.g., EMAIL, SMS) */
  readonly type: ContactType;
  /**
   * Send a notification using the channel's configuration.
   * @param config - the channel's configuration
   * @param payload - the notification payload
   * @throws Error if sending fails
   */
  sendFromConfig(config: unknown, payload: NotificationPayload): Promise<void>;
}