import { ContactType, CellphoneProvider } from '@prisma/client';

export class UpdateUserContactDto {
  label?: string;
  type?: ContactType;
  value?: string;
  provider?: CellphoneProvider | null;
  enabled?: boolean;
}