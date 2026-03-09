import { IsEmail, IsNotEmpty, IsString } from 'class-validator'

import { TEXT } from '../../common/constants/text.js'

export class ForgotPasswordDTO {
  @IsString({ message: TEXT.VALIDATION.BE.STRING })
  @IsEmail({}, { message: TEXT.VALIDATION.EMAIL.INVALID })
  @IsNotEmpty({ message: TEXT.VALIDATION.REQUIRED })
  email: string
}
