import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../shared/database/prisma.service';
import { ContactType } from '@prisma/client';

@Injectable()
export class UserContactsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    return await this.prisma.userContact.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  async findAllEnabled() {
    return await this.prisma.userContact.findMany({
      where: { enabled: true },
    });
  }

  async findById(id: string) {
    return await this.prisma.userContact.findUnique({ where: { id } });
  }

  async create(data: {
    label: string;
    type: ContactType;
    value: string;
  }) {
    return await this.prisma.userContact.create({ data });
  }

  async update(
    id: string,
    data: Partial<{
      label: string;
      type: ContactType;
      value: string;
      enabled: boolean;
    }>,
  ) {
    return await this.prisma.userContact.update({
      where: { id },
      data,
    });
  }

  async delete(id: string) {
    return await this.prisma.userContact.delete({ where: { id } });
  }
}