import {
	BadRequestException,
	ConflictException,
	Injectable,
	InternalServerErrorException,
	NotFoundException,
	UnauthorizedException
} from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { verify } from 'argon2'
import type { Request } from 'express'

import { PrismaService } from '@/src/core/prisma/prisma.service'
import { RedisService } from '@/src/core/redis/redis.service'
import { LoginInput } from '@/src/modules/auth/session/inputs/login.input'
import { VerificationService } from '@/src/modules/auth/verification/verification.service'
import { getSessionMetadata } from '@/src/shared/utils/session-metadata.util'
import { destroySession, saveSession } from '@/src/shared/utils/session.util'

@Injectable()
export class SessionService {
	public constructor(
		private readonly prismaService: PrismaService,
		private readonly configService: ConfigService,
		private readonly redisService: RedisService,
		private readonly verificationService: VerificationService
	) {}

	/**
	 * @description Finds all sessions associated with a user.
	 * This method retrieves the sessions of a specific user from Redis
	 * and sorts them by creation date, returning only the current session.
	 *
	 * @throws {NotFoundException} If the user is not found in the session.
	 */
	public async findByUser(req: Request) {
		const userId = req.session.userId
		if (!userId) {
			throw new NotFoundException('User not found')
		}

		const keys = await this.redisService.keys('*')
		const userSessions = []

		for (const key of keys) {
			const sessionData = await this.redisService.get(key)
			if (sessionData) {
				const session = JSON.parse(sessionData)
				if (session.userId === userId) {
					userSessions.push({
						...session,
						id: key.split(':')[1]
					})
				}
			}
		}

		userSessions.sort((a, b) => b.createdAt - a.createdAt)
		return userSessions.filter(session => session.id !== req.session.id)
	}

	/**
	 * @description Finds the current session of a user.
	 * This method retrieves the session data for the currently active session
	 * and returns it along with the session ID.
	 *
	 * @returns {Object} The current session data with the session ID.
	 */
	public async findCurrent(req: Request) {
		const sessionId = req.session.id
		const sessionKey = `${this.configService.getOrThrow<string>('SESSION_FOLDER')}${sessionId}`
		const sessionData = await this.redisService.get(sessionKey)
		const session = JSON.parse(sessionData)

		return {
			...session,
			id: sessionId
		}
	}

	/**
	 * @description Handles user login.
	 * This method authenticates the user by checking the provided credentials (username/email & password),
	 * and if valid, it creates a session for the user and saves it in Redis.
	 *
	 * @param {LoginInput} input - Login credentials (login and password)
	 * @param {string} userAgent - User agent string from the request headers
	 *
	 * @throws {NotFoundException} If the user is not found.
	 * @throws {UnauthorizedException} If the password is invalid.
	 */
	public async login(req: Request, input: LoginInput, userAgent: string) {
		const { login, password } = input

		const user = await this.prismaService.user.findFirst({
			where: {
				OR: [
					{
						username: {
							equals: login
						}
					},
					{
						email: {
							equals: login
						}
					}
				]
			}
		})

		if (!user) {
			throw new NotFoundException('User not found')
		}

		const isValidPassword = await verify(user.password, password)
		if (!isValidPassword) {
			throw new UnauthorizedException('Invalid password')
		}

		if (!user.isEmailVerified) {
			await this.verificationService.sendVerificationToken(user)
			throw new BadRequestException('Email not verified')
		}

		const metadata = getSessionMetadata(req, userAgent)

		return saveSession(req, user, metadata)
	}

	/**
	 * @description Handles user logout.
	 * This method destroys the current session and clears the session cookie.
	 *
	 * @returns {boolean} True if logout was successful.
	 */
	public async logout(req: Request) {
		return destroySession(req, this.configService)
	}

	/**
	 * @description Clears the session cookie.
	 * This method clears the session cookie from the user's browser.
	 *
	 * @returns {boolean} Always returns true.
	 */
	public async clearSession(req: Request) {
		req.res.clearCookie(this.configService.getOrThrow('SESSION_NAME'))
		return true
	}

	/**
	 * @description Removes a session from Redis.
	 * This method removes the session by its ID from Redis, ensuring the current session is not removed.
	 *
	 * @param {string} id - The session ID to remove.
	 *
	 * @throws {ConflictException} If the session to remove is the current active session.
	 */
	public async remove(req: Request, id: string) {
		const sessionKey = `${this.configService.getOrThrow('SESSION_FOLDER')}${id}`
		if (req.session.id === id) {
			throw new ConflictException('Cannot remove current session')
		}

		await this.redisService.del(sessionKey)
		return true
	}
}
