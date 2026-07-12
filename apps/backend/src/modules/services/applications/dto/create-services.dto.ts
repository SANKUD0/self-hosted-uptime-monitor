import { ServiceType } from '@prisma/client';
import { IsBoolean, IsEnum, IsInt, IsOptional, IsString } from 'class-validator';

export class CreateServiceDto {
  @IsString()
  name!: string;

  @IsEnum(ServiceType)
  type!: ServiceType;

  @IsString()
  target!: string;

  @IsOptional()
  @IsInt()
  intervalSeconds?: number;

  @IsOptional()
  @IsInt()
  timeoutMs?: number;

  @IsOptional()
  @IsInt()
  failureThreshold?: number;

  @IsOptional()
  @IsBoolean()
  enabled?: boolean;
}