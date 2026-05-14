import { ContactType, CellphoneProvider } from '@prisma/client';

export class CreateUserContactDto {
  label!: string;
  type!: ContactType;
  value!: string;
  provider?: CellphoneProvider;
  enabled?: boolean;
}