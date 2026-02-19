import { IsEmail, IsNotEmpty, IsString, MinLength, Validate } from 'class-validator'

import { TEXT } from '../../common/constants/text.js'
import { PASSWORD } from '../constants/password.constants.js'
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
  @MinLength(PASSWORD.VALIDATION.MIN_LENGTH, {
    message: TEXT.VALIDATION.min(PASSWORD.VALIDATION.MIN_LENGTH)
  })
  password: string

  @IsString({ message: TEXT.VALIDATION.BE.STRING })
  @IsNotEmpty({ message: TEXT.VALIDATION.REQUIRED })
  @MinLength(PASSWORD.VALIDATION.MIN_LENGTH, {
    message: TEXT.VALIDATION.min(PASSWORD.VALIDATION.MIN_LENGTH)
  })
  @Validate(IsPasswordsMatchingConstraint, { message: TEXT.VALIDATION.PASSWORD.NOT_MATCH })
  passwordRepeat: string
}
