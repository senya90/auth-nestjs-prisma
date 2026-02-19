import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator'

import { TEXT } from '../../common/constants/text.js'
import { PASSWORD } from '../constants/password.constants.js'

export class LoginDTO {
  @IsString({ message: TEXT.VALIDATION.BE.STRING })
  @IsEmail({}, { message: TEXT.VALIDATION.EMAIL.INVALID })
  @IsNotEmpty({ message: TEXT.VALIDATION.REQUIRED })
  email: string

  @IsString({ message: TEXT.VALIDATION.BE.STRING })
  @IsNotEmpty({ message: TEXT.VALIDATION.REQUIRED })
  @MinLength(PASSWORD.VALIDATION.MIN_LENGTH, {
    message: TEXT.VALIDATION.min(PASSWORD.VALIDATION.MIN_LENGTH)
  })
  password: string
}
