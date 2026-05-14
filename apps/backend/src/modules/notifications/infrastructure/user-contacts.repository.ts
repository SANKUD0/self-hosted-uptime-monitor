import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../shared/database/prisma.service';
import { ContactType } from '@prisma/client';

@Injectable()
export class UserContactsRepository {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.userContact.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  findAllEnabled() {
    return this.prisma.userContact.findMany({
      where: { enabled: true },
    });
  }

  findById(id: string) {
    return this.prisma.userContact.findUnique({ where: { id } });
  }

  create(data: {
    label: string;
    type: ContactType;
    value: string;
  }) {
    return this.prisma.userContact.create({ data });
  }

  update(
    id: string,
    data: Partial<{
      label: string;
      type: ContactType;
      value: string;
      enabled: boolean;
    }>,
  ) {
    return this.prisma.userContact.update({
      where: { id },
      data,
    });
  }

  delete(id: string) {
    return this.prisma.userContact.delete({ where: { id } });
  }
}