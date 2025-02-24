import { Injectable } from '@nestjs/common'
import { hash } from 'argon2'

import { PrismaService } from '@/src/core/prisma/prisma.service'
import { CreateUserInput } from '@/src/modules/auth/account/inputs/create-user.input'
import { checkExist } from '@/src/shared/helpers/checkExist.helper'

@Injectable()
export class AccountService {
	public constructor(private readonly prismaService: PrismaService) {}

	public async findAll() {
		const users = await this.prismaService.user.findMany()

		return users
	}

	public async create(input: CreateUserInput) {
		const { email, password, username } = input

		await checkExist(this.prismaService, 'user', 'username', username)
		await checkExist(this.prismaService, 'user', 'email', email)

		await this.prismaService.user.create({
			data: {
				username,
				email,
				password: await hash(password),
				displayName: username
			}
		})

		return true
	}
}
