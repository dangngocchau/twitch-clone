import { ConflictException } from '@nestjs/common'

import { PrismaService } from '@/src/core/prisma/prisma.service'

export async function checkExist(
	prismaService: PrismaService,
	model: string,
	field: string,
	value: string
) {
	const result = await prismaService[model].findUnique({
		where: {
			[field]: value
		}
	})

	if (result) {
		throw new ConflictException(
			`${field.charAt(0).toUpperCase() + field.slice(1)} already exists in ${model}`
		)
	}
}
