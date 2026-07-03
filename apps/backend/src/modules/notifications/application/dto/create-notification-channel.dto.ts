import { ContactType } from "@prisma/client";
import { Type } from "class-transformer";
import { IsBoolean, IsIn, IsInt, isInt, IsString, ValidateNested } from "class-validator";

/**
 * DTO for creating an SMTP notification channel.
 * This DTO is used to validate the input data when creating a new SMTP channel.
 * It ensures that all required fields are provided and have the correct types.
 */
export class CreateSmtpChannelDto {
    @IsIn([ContactType.EMAIL])
    type!: 'EMAIL'; // Must be 'EMAIL' to match the ContactType enum

    @IsString()
    smtpHost!: string;

    @IsString()
    smtpPort!: string;

    @IsString()
    smtpUsernameFrom!: string;

    @IsString()
    smtpPassword!: string;

    @IsString()
    recipientEmail!: string;

    @IsBoolean()
    enabled!: boolean;
}
/**
 * DTO for creating a Discord notification channel.
 * This DTO is used to validate the input data when creating a new Discord channel.
 * It ensures that all required fields are provided and have the correct types.
 */
export class CreateDiscordChannelDto {
    @IsIn([ContactType.DISCORD])
    type!: 'DISCORD'; // Must be 'DISCORD' to match the ContactType enum

    @IsString()
    webhookUrl!: string;

    @IsBoolean()
    enabled!: boolean;
}

/**
 * DTO for creating a notification channel.
 * This DTO is used to validate the input data when creating a new notification channel.
 * It uses a discriminator to determine which specific channel type (SMTP or Discord) is being created.
 * The `data` property can be either a `CreateSmtpChannelDto` or a `CreateDiscordChannelDto`.
 * The appropriate DTO will be validated based on the `type` property in the input data.
 */
export class CreateNotificationChannelDto {
    @Type(() => Object, {
        discriminator: {
            property: 'type',
            subTypes: [
                { value: CreateSmtpChannelDto, name: 'EMAIL' },
                { value: CreateDiscordChannelDto, name: 'DISCORD' },
            ],
        },
    })
    @ValidateNested()
    data!:
        CreateSmtpChannelDto |
        CreateDiscordChannelDto;
}