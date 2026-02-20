import { CanActivate, ExecutionContext } from '@nestjs/common'
import { Reflector } from '@nestjs/core'

import { PERMISSIONS } from '../constants/permissions.constants.js'
import { ROLE } from '../constants/roles.constants.js'

export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<ROLE[]>(PERMISSIONS.DECORATOR_KEY, [
      context.getHandler(),
      context.getClass()
    ])

    if (!requiredRoles) return true

    // todo: описать тип
    const { user } = context.switchToHttp().getRequest()
    return requiredRoles.some((role) => user?.roles?.includes(role))
  }
}
