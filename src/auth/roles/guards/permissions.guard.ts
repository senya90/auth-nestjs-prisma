import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common'
import { Reflector } from '@nestjs/core'

import { PermissionName } from '../../../__generated__/enums.js'
import { AuthenticatedRequest } from '../../types/authenticated-request.type.js'
import { PERMISSIONS } from '../constants/permissions.constants.js'

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredPermissions = this.reflector.getAllAndOverride<
      PermissionName[]
    >(PERMISSIONS.DECORATOR_KEY, [context.getHandler(), context.getClass()])

    if (!requiredPermissions) return true

    const { user } = context.switchToHttp().getRequest<AuthenticatedRequest>()

    const userPermissions = user?.roles.flatMap((role) =>
      role.permissions.map((per) => per.name)
    )

    return requiredPermissions.some((permission) =>
      userPermissions?.includes(permission)
    )
  }
}
