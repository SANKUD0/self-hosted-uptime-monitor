import { ServiceType } from "@prisma/client";

export class UpdateServiceDto {
    name?: string;
    type?: ServiceType;
    target?: string;
    intervalSeconds?: number;
    timeoutMs?: number;
    failureThreshold?: number;
    enabled?: boolean;
}