import { SetMetadata } from '@nestjs/common'

import { ROLE, ROLES } from '../constants/roles.constants.js'

export const Roles = (...roles: ROLE[]) => SetMetadata(ROLES.DECORATOR_KEY, roles)
