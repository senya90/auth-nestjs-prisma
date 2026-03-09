import { IsNotEmpty, IsString, MinLength, Validate } from 'class-validator'

import { TEXT } from '../../common/constants/text.js'
import { PASSWORD } from '../constants/password.constants.js'
import { IsPasswordsMatchingConstraint } from '../decorators/is-passwords-matching-constraint.decorator.js'

export class ResetPasswordDTO {
  @IsString({ message: TEXT.VALIDATION.BE.STRING })
  @IsNotEmpty({ message: TEXT.VALIDATION.REQUIRED })
  token: string

  @IsString({ message: TEXT.VALIDATION.BE.STRING })
  @IsNotEmpty({ message: TEXT.VALIDATION.REQUIRED })
  @MinLength(PASSWORD.VALIDATION.MIN_LENGTH, {
    message: TEXT.VALIDATION.min(PASSWORD.VALIDATION.MIN_LENGTH)
  })
  newPassword: string

  @IsString({ message: TEXT.VALIDATION.BE.STRING })
  @IsNotEmpty({ message: TEXT.VALIDATION.REQUIRED })
  @MinLength(PASSWORD.VALIDATION.MIN_LENGTH, {
    message: TEXT.VALIDATION.min(PASSWORD.VALIDATION.MIN_LENGTH)
  })
  @Validate(IsPasswordsMatchingConstraint, {
    message: TEXT.VALIDATION.PASSWORD.NOT_MATCH
  })
  newPasswordRepeat: string
}
