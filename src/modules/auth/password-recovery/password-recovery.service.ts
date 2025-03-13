import {
	BadRequestException,
	Injectable,
	NotFoundException
} from '@nestjs/common'
import { hash } from 'argon2'
import type { Request } from 'express'

import { TokenType } from '@/prisma/generated'
import { PrismaService } from '@/src/core/prisma/prisma.service'
import { NewPassWordInput } from '@/src/modules/auth/password-recovery/inputs/new-passwprd.input'
import { ResetPasswordInput } from '@/src/modules/auth/password-recovery/inputs/reset-password.input'
import { MailService } from '@/src/modules/libs/mail/mail.service'
import { generateToken } from '@/src/shared/utils/generate-token.utils'
import { getSessionMetadata } from '@/src/shared/utils/session-metadata.util'

@Injectable()
export class PasswordRecoveryService {
	public constructor(
		private readonly prismaService: PrismaService,
		private readonly mailService: MailService
	) {}

	public async resetPassword(
		req: Request,
		input: ResetPasswordInput,
		userAgent: string
	) {
		const { email } = input

		const user = await this.prismaService.user.findUnique({
			where: { email }
		})

		if (!user) {
			throw new NotFoundException('User not found')
		}

		const resetToken = await generateToken(
			this.prismaService,
			user,
			TokenType.PASSWORD_RESET
		)

		const metadata = getSessionMetadata(req, userAgent)

		await this.mailService.sendPasswordRecoveryEmail(
			user.email,
			resetToken.token,
			metadata
		)

		return true
	}

	public async newPassword(input: NewPassWordInput) {
		const { token, password } = input

		const existingToken = await this.prismaService.token.findUnique({
			where: { token, type: TokenType.PASSWORD_RESET }
		})

		if (!existingToken) {
			throw new NotFoundException('Token not found')
		}

		const hasExpired = new Date(existingToken.expriresIn) < new Date()
		if (hasExpired) {
			throw new BadRequestException('Token has expired')
		}

		await this.prismaService.user.update({
			where: { id: existingToken.userId },
			data: {
				password: await hash(password)
			}
		})

		await this.prismaService.token.delete({
			where: { id: existingToken.id, type: TokenType.PASSWORD_RESET }
		})

		return true
	}
}
