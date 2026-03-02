import { SetMetadata } from '@nestjs/common'

import { PERMISSIONS } from '../constants/permissions.constants.js'

export const Permissions = (...permissions: PermissionName[]) =>
  SetMetadata(PERMISSIONS.DECORATOR_KEY, permissions)
