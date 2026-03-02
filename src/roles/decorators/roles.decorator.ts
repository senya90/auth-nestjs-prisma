import { SetMetadata } from '@nestjs/common'

import { RoleName } from '../../__generated__/enums.js'
import { ROLES } from '../constants/roles.constants.js'

export const Roles = (...roles: RoleName[]) =>
  SetMetadata(ROLES.DECORATOR_KEY, roles)
