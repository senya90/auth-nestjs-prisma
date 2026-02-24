import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common'
import { Reflector } from '@nestjs/core'

import { AuthenticatedRequest } from '../../types/authenticated-request.type.js'
import { ROLE, ROLES } from '../constants/roles.constants.js'

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<ROLE[]>(
      ROLES.DECORATOR_KEY,
      [context.getHandler(), context.getClass()]
    )

    if (!requiredRoles) return true

    const { user } = context.switchToHttp().getRequest<AuthenticatedRequest>()

    return requiredRoles.some((role) =>
      user?.roles?.find((r) => r.name === role)
    )
  }
}
