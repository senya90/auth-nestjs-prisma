import { IsNotEmpty, IsString } from 'class-validator'

import { TEXT } from '../../../common/constants/text.js'

export class AssignPermissionDTO {
  @IsString({ message: TEXT.VALIDATION.BE.STRING })
  @IsNotEmpty({ message: TEXT.VALIDATION.REQUIRED })
  roleId: string

  @IsString({ message: TEXT.VALIDATION.BE.STRING })
  @IsNotEmpty({ message: TEXT.VALIDATION.REQUIRED })
  permissionId: string
}
