// utils/sms-gateway.ts
import { CellphoneProvider } from '@prisma/client';

const GATEWAYS: Record<CellphoneProvider, string> = {
  BELL: 'txt.bell.ca',
  VIDEOTRON: 'vmobile.ca',
  ROGERS: 'pcs.rogers.com',
  TELUS: 'msg.telus.com',
  KOODO: 'msg.telus.com',
  FIDO: 'fido.ca',
  PUBLIC_MOBILE: 'msg.telus.com',
  LUCKY_MOBILE: 'txt.bell.ca',
  FREEDOM: 'txt.freedommobile.ca',
  CHATR: 'pcs.rogers.com',
};

export function smsToEmailAddress(
  phoneNumber: string,
  provider: CellphoneProvider,
): string {
  // Nettoyer le numéro : garder uniquement les chiffres
  const digits = phoneNumber.replace(/\D/g, '');
  
  // Vérifier qu'on a 10 ou 11 chiffres
  const tenDigits = digits.length === 11 ? digits.slice(1) : digits;
  if (tenDigits.length !== 10) {
    throw new Error(`Numéro invalide : ${phoneNumber}`);
  }

  const gateway = GATEWAYS[provider];
  return `${tenDigits}@${gateway}`;
}