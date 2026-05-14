/**
 * Payload d'une notification à envoyer.
 */
export interface NotificationPayload {
  title: string;
  message: string;
}

/**
 * Interface que tous les notifiers doivent implémenter.
 * Pattern Strategy : permet d'avoir EmailNotifier, SmsNotifier, etc.
 */
export interface Notifier {
  /**
   * Envoie une notification au destinataire.
   * 
   * @param recipient - adresse email pour EmailNotifier, numéro pour SmsNotifier
   * @param payload - contenu de la notification
   * @throws Error si l'envoi échoue
   */
  send(recipient: string, payload: NotificationPayload): Promise<void>;
}