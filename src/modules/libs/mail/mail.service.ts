import { MailerService } from '@nestjs-modules/mailer'
import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { render } from '@react-email/components'

import PasswordRecoveryTemplate from '@/src/modules/libs/mail/templates/password-recovery.template'
import VerificationTemplate from '@/src/modules/libs/mail/templates/verification.template'
import { SessionMetadata } from '@/src/shared/types/session-metadata.type'

@Injectable()
export class MailService {
	public constructor(
		private readonly mailerService: MailerService,
		private readonly configService: ConfigService
	) {}

	public async sendVerificationEmail(email: string, token: string) {
		const domain = this.configService.getOrThrow<string>('ALLOWED_ORIGINS')
		const html = await render(VerificationTemplate({ domain, token }))

		return this.sendMail(email, 'Verify your account', html)
	}

	public async sendPasswordRecoveryEmail(
		email: string,
		token: string,
		metadata: SessionMetadata
	) {
		const domain = this.configService.getOrThrow<string>('ALLOWED_ORIGINS')
		const html = await render(
			PasswordRecoveryTemplate({ domain, token, metadata })
		)

		return this.sendMail(email, 'Password recovery', html)
	}

	private sendMail(email: string, subject: string, html: string) {
		return this.mailerService.sendMail({
			to: email,
			subject,
			html
		})
	}
}
