import { IsEmail, IsNotEmpty, IsString, MinLength, Validate } from 'class-validator'

import { TEXT } from '../../libs/common/constants/text.js'
import { IsPasswordsMatchingConstraint } from '../decorators/is-passwords-matching-constraint.decorator.js'

export class RegisterDTO {
  @IsString({ message: TEXT.VALIDATION.BE.STRING })
  @IsNotEmpty({ message: TEXT.VALIDATION.REQUIRED })
  name: string

  @IsString({ message: TEXT.VALIDATION.BE.STRING })
  @IsNotEmpty({ message: TEXT.VALIDATION.REQUIRED })
  @IsEmail({}, { message: TEXT.VALIDATION.EMAIL.INVALID })
  email: string

  @IsString({ message: TEXT.VALIDATION.BE.STRING })
  @IsNotEmpty({ message: TEXT.VALIDATION.REQUIRED })
  @MinLength(12, { message: TEXT.VALIDATION.min(12) })
  password: string

  @IsString({ message: TEXT.VALIDATION.BE.STRING })
  @IsNotEmpty({ message: TEXT.VALIDATION.REQUIRED })
  @MinLength(12, { message: TEXT.VALIDATION.min(12) })
  @Validate(IsPasswordsMatchingConstraint, { message: TEXT.VALIDATION.PASSWORD.NOT_MATCH })
  passwordRepeat: string
}
