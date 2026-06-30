import { Type } from "class-transformer";
import { IsBoolean, IsIn, IsInt, isInt, IsString, ValidateNested } from "class-validator";

/**
 * DTO for creating an SMTP notification channel.
 * This DTO is used to validate the input data when creating a new SMTP channel.
 * It ensures that all required fields are provided and have the correct types.
 */
export class CreateSmtpChannelDto {
    @IsIn(['smtp'])
    type!: 'smtp';

    @IsString()
    smtpHost!: string;

    @IsInt()
    SMTPPort!: number;

    @IsString()
    SMTPUsernameFrom!: string;

    @IsString()
    SMTPPassword!: string;

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
    @IsIn(['discord'])
    type!: 'discord';

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
                { value: CreateSmtpChannelDto, name: 'smtp' },
                { value: CreateDiscordChannelDto, name: 'discord' },
            ],
        },
    })
    @ValidateNested()
    data!:
        CreateSmtpChannelDto |
        CreateDiscordChannelDto;
}