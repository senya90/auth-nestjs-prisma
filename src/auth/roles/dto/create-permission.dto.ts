import { IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator'

import { PermissionName } from '../../../__generated__/enums.js'
import { TEXT } from '../../../common/constants/text.js'
import { ROLES } from '../constants/roles.constants.js'

export class CreatePermissionDTO {
  @IsString({ message: TEXT.VALIDATION.BE.STRING })
  @IsNotEmpty({ message: TEXT.VALIDATION.REQUIRED })
  @MinLength(ROLES.VALIDATION.PERMISSION.NAME.MIN_LENGTH, {
    message: TEXT.VALIDATION.min(ROLES.VALIDATION.PERMISSION.NAME.MIN_LENGTH)
  })
  @MaxLength(ROLES.VALIDATION.PERMISSION.NAME.MAX_LENGTH, {
    message: TEXT.VALIDATION.min(ROLES.VALIDATION.PERMISSION.NAME.MAX_LENGTH)
  })
  name: PermissionName

  @IsString({ message: TEXT.VALIDATION.BE.STRING })
  @MinLength(ROLES.VALIDATION.PERMISSION.DESCRIPTION.MIN_LENGTH, {
    message: TEXT.VALIDATION.min(
      ROLES.VALIDATION.PERMISSION.DESCRIPTION.MIN_LENGTH
    )
  })
  @MaxLength(ROLES.VALIDATION.PERMISSION.DESCRIPTION.MAX_LENGTH, {
    message: TEXT.VALIDATION.min(
      ROLES.VALIDATION.PERMISSION.DESCRIPTION.MAX_LENGTH
    )
  })
  description?: string
}
