import { ContactType } from '@prisma/client';

export class CreateUserContactDto {
  label!: string;
  type!: ContactType;
  value!: string;
  enabled?: boolean;
}