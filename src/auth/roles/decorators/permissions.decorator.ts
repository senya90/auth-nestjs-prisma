import { SetMetadata } from '@nestjs/common'

import { PERMISSION, PERMISSIONS } from '../constants/permissions.constants.js'

export const Permissions = (...permissions: PERMISSION[]) =>
  SetMetadata(PERMISSIONS.DECORATOR_KEY, permissions)
