import { Field } from '@nestjs/graphql'
import { IsNotEmpty, IsString, MinLength } from 'class-validator'

export class LoginInput {
	@Field()
	@IsString()
	@IsNotEmpty()
	public login: string

	@Field()
	@IsString()
	@IsNotEmpty()
	@MinLength(8)
	public password: string
}
