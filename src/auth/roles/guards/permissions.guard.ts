import { CanActivate, ExecutionContext } from '@nestjs/common'
import { Reflector } from '@nestjs/core'

import { PERMISSION, PERMISSIONS } from '../constants/permissions.constants.js'

export class PermissionsGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredPermissions = this.reflector.getAllAndOverride<PERMISSION[]>(
      PERMISSIONS.DECORATOR_KEY,
      [context.getHandler(), context.getClass()]
    )

    if (!requiredPermissions) return true

    // todo: описать тип
    // const { user } = context.switchToHttp().getRequest()

    // вычислить по user.permissions
    // return requiredRoles.some((role) => user?.roles?.includes(role))

    return false
  }
}
