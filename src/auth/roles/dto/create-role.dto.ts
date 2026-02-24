import { IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator'

import { RoleName } from '../../../__generated__/enums.js'
import { TEXT } from '../../../common/constants/text.js'
import { ROLES } from '../constants/roles.constants.js'

export class CreateRoleDTO {
  @IsString({ message: TEXT.VALIDATION.BE.STRING })
  @IsNotEmpty({ message: TEXT.VALIDATION.REQUIRED })
  @MinLength(ROLES.VALIDATION.ROLE.NAME.MIN_LENGTH, {
    message: TEXT.VALIDATION.min(ROLES.VALIDATION.ROLE.NAME.MIN_LENGTH)
  })
  @MaxLength(ROLES.VALIDATION.ROLE.NAME.MAX_LENGTH, {
    message: TEXT.VALIDATION.min(ROLES.VALIDATION.ROLE.NAME.MAX_LENGTH)
  })
  name: RoleName

  @IsString({ message: TEXT.VALIDATION.BE.STRING })
  @MinLength(ROLES.VALIDATION.ROLE.DESCRIPTION.MIN_LENGTH, {
    message: TEXT.VALIDATION.min(ROLES.VALIDATION.ROLE.DESCRIPTION.MIN_LENGTH)
  })
  @MaxLength(ROLES.VALIDATION.ROLE.DESCRIPTION.MAX_LENGTH, {
    message: TEXT.VALIDATION.min(ROLES.VALIDATION.ROLE.DESCRIPTION.MAX_LENGTH)
  })
  description?: string
}
