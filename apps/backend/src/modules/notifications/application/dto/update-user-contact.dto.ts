import { ContactType } from '@prisma/client';

export class UpdateUserContactDto {
  label?: string;
  type?: ContactType;
  value?: string;
  enabled?: boolean;
}