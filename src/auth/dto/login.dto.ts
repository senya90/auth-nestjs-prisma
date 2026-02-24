import { IsEmail, IsNotEmpty, IsString } from 'class-validator'

import { TEXT } from '../../common/constants/text.js'

export class LoginDTO {
  @IsString({ message: TEXT.VALIDATION.BE.STRING })
  @IsEmail({}, { message: TEXT.VALIDATION.EMAIL.INVALID })
  @IsNotEmpty({ message: TEXT.VALIDATION.REQUIRED })
  email: string

  @IsString({ message: TEXT.VALIDATION.BE.STRING })
  @IsNotEmpty({ message: TEXT.VALIDATION.REQUIRED })
  password: string
}
