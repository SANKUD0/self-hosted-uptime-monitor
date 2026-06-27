import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { NotificationsService } from '../application/notifications.service';
import { CreateUserContactDto } from '../application/dto/create-user-contact.dto';
import { UpdateUserContactDto } from '../application/dto/update-user-contact.dto';

@Controller('user-contacts')
export class UserContactsController {
  constructor(private readonly service: NotificationsService) {}

  @Get()
  async findAll() {
    return await this.service.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return await this.service.findOne(id);
  }

  @Post()
  async create(@Body() dto: CreateUserContactDto) {
    return await this.service.create(dto);
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() dto: UpdateUserContactDto) {
    return await this.service.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string) {
    return await this.service.remove(id);
  }
}