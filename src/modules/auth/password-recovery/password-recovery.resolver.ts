import { Args, Context, Mutation, Resolver } from '@nestjs/graphql'

import { NewPassWordInput } from '@/src/modules/auth/password-recovery/inputs/new-passwprd.input'
import { ResetPasswordInput } from '@/src/modules/auth/password-recovery/inputs/reset-password.input'
import { UserAgent } from '@/src/shared/decorators/user-agent.decorator'
import { GraphQLContext } from '@/src/shared/types/graphql-context.type'

import { PasswordRecoveryService } from './password-recovery.service'

@Resolver('PasswordRecovery')
export class PasswordRecoveryResolver {
	public constructor(
		private readonly passwordRecoveryService: PasswordRecoveryService
	) {}

	@Mutation(() => Boolean, { name: 'resetPassword' })
	public async resetPassword(
		@Context() { req }: GraphQLContext,
		@Args('data') input: ResetPasswordInput,
		@UserAgent() userAgent: string
	) {
		return this.passwordRecoveryService.resetPassword(req, input, userAgent)
	}

	@Mutation(() => Boolean, { name: 'newPassword' })
	public async newPassword(@Args('data') input: NewPassWordInput) {
		return this.passwordRecoveryService.newPassword(input)
	}
}
