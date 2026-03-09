import { IsNotEmpty, IsString, MinLength } from 'class-validator'

import { TEXT } from '../../common/constants/text.js'
import { PASSWORD } from '../constants/password.constants.js'

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
}
