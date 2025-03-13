import {
	ValidationArguments,
	ValidatorConstraint,
	ValidatorConstraintInterface
} from 'class-validator'

import { NewPassWordInput } from '@/src/modules/auth/password-recovery/inputs/new-passwprd.input'

@ValidatorConstraint({ name: 'isPasswordMatch', async: false })
export class IsPasswordMatch implements ValidatorConstraintInterface {
	public validate(passwordRepeat: string, args: ValidationArguments) {
		const object = args.object as NewPassWordInput
		return object.password === passwordRepeat
	}

	public defaultMessage(validationArguments?: ValidationArguments) {
		return 'Passwords do not match'
	}
}
