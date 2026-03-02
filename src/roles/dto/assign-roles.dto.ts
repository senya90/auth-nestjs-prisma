import { IsArray, IsNotEmpty, IsString } from 'class-validator'

import { TEXT } from '../../common/constants/text.js'

export class AssignRolesDTO {
  @IsArray({ message: TEXT.VALIDATION.BE.ARRAY })
  @IsString({ each: true, message: TEXT.VALIDATION.BE.STRING })
  rolesIds: string[]

  @IsString({ message: TEXT.VALIDATION.BE.STRING })
  @IsNotEmpty({ message: TEXT.VALIDATION.REQUIRED })
  userId: string
}
