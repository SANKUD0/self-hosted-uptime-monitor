import { ServiceType } from "@prisma/client";
import { IsBoolean, IsEnum, IsInt, IsOptional, IsString } from "class-validator";

export class UpdateServiceDto {
    @IsOptional()
    @IsString()
    name?: string;

    @IsOptional()
    @IsEnum(ServiceType)
    type?: ServiceType;

    @IsOptional()
    @IsString()
    target?: string;

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