import { MailerOptions } from '@nestjs-modules/mailer'
import { ConfigService } from '@nestjs/config'

export function getMailerConfig(configService: ConfigService): MailerOptions {
	return {
		transport: {
			host: configService.getOrThrow<string>('MAILER_HOST'),
			port: configService.getOrThrow<number>('MAILER_PORT'),
			secure: true,
			auth: {
				user: configService.getOrThrow<string>('MAILER_LOGIN'),
				pass: configService.getOrThrow<string>('MAILER_PASSWORD')
			},
			defaults: {
				from: `"Twitch Clone" ${configService.getOrThrow<string>('MAILER_LOGIN')}`
			}
		}
	}
}
