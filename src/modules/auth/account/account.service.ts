import { Injectable } from '@nestjs/common'
import { hash } from 'argon2'

import { PrismaService } from '@/src/core/prisma/prisma.service'
import { CreateUserInput } from '@/src/modules/auth/account/inputs/create-user.input'
import { VerificationService } from '@/src/modules/auth/verification/verification.service'
import { checkExist } from '@/src/shared/helpers/checkExist.helper'

@Injectable()
export class AccountService {
	public constructor(
		private readonly prismaService: PrismaService,
		private readonly verificationService: VerificationService
	) {}

	public async me(id: string) {
		const user = await this.prismaService.user.findUnique({
			where: {
				id
			}
		})

		return user
	}

	public async create(input: CreateUserInput) {
		const { email, password, username } = input

		await checkExist(this.prismaService, 'user', 'username', username)
		await checkExist(this.prismaService, 'user', 'email', email)

		const user = await this.prismaService.user.create({
			data: {
				username,
				email,
				password: await hash(password),
				displayName: username
			}
		})

		await this.verificationService.sendVerificationToken(user)

		return true
	}
}
