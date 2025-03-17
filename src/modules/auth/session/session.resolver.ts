import { Args, Context, Mutation, Query, Resolver } from '@nestjs/graphql'

import { AuthModel } from '@/src/modules/auth/account/models/auth.model'
import { UserModel } from '@/src/modules/auth/account/models/user.model'
import { LoginInput } from '@/src/modules/auth/session/inputs/login.input'
import { SessionModel } from '@/src/modules/auth/session/models/session.model'
import { Authorization } from '@/src/shared/decorators/auth.decorator'
import { UserAgent } from '@/src/shared/decorators/user-agent.decorator'
import { GraphQLContext } from '@/src/shared/types/graphql-context.type'

import { SessionService } from './session.service'

@Resolver('Session')
export class SessionResolver {
	constructor(private readonly sessionService: SessionService) {}

	@Authorization()
	@Query(() => [SessionModel], { name: 'findSessionsByUser' })
	public async findByUser(@Context() { req }: GraphQLContext) {
		return this.sessionService.findByUser(req)
	}

	@Authorization()
	@Query(() => SessionModel, { name: 'findCurrentSession' })
	public async findCurrent(@Context() { req }: GraphQLContext) {
		return this.sessionService.findCurrent(req)
	}

	@Mutation(() => AuthModel, { name: 'loginUser' })
	public async login(
		@Context() { req }: GraphQLContext,
		@Args('data') input: LoginInput,
		@UserAgent() userAgent: string
	) {
		return this.sessionService.login(req, input, userAgent)
	}

	@Authorization()
	@Mutation(() => Boolean, { name: 'logoutUser' })
	public async logout(@Context() { req }: GraphQLContext) {
		return this.sessionService.logout(req)
	}

	@Authorization()
	@Mutation(() => Boolean, { name: 'clearSession' })
	public async clearSession(@Context() { req }: GraphQLContext) {
		return this.sessionService.clearSession(req)
	}

	@Authorization()
	@Mutation(() => Boolean, { name: 'removeSession' })
	public async remove(
		@Context() { req }: GraphQLContext,
		@Args('id') id: string
	) {
		return this.sessionService.remove(req, id)
	}
}
