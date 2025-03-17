import { InternalServerErrorException } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { Request } from 'express'

import { User } from '@/prisma/generated'
import { SessionMetadata } from '@/src/shared/types/session-metadata.type'

export function saveSession(
	req: Request,
	user: User,
	metadata: SessionMetadata
) {
	return new Promise((resolve, reject) => {
		req.session.createdAt = new Date()
		req.session.userId = user.id
		req.session.metadata = metadata

		req.session.save(err => {
			if (err) {
				return reject(
					new InternalServerErrorException('Error saving session')
				)
			}

			resolve({ user })
		})
	})
}

export function destroySession(req: Request, configService: ConfigService) {
	return new Promise((resolve, reject) => {
		req.session.destroy(err => {
			if (err) {
				return reject(
					new InternalServerErrorException('Error destroying session')
				)
			}

			req.res.clearCookie(configService.getOrThrow('SESSION_NAME'))
			resolve(true)
		})
	})
}
