import { CanActivate, ExecutionContext } from '@nestjs/common'
import { Reflector } from '@nestjs/core'

import { TokenPayload } from '../../types/token-payload.type.js'
import { ROLE, ROLES } from '../constants/roles.constants.js'

interface AuthenticatedRequest extends Request {
  user: TokenPayload
}

export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<ROLE[]>(
      ROLES.DECORATOR_KEY,
      [context.getHandler(), context.getClass()]
    )

    if (!requiredRoles) return true

    // todo: описать тип
    const { user } = context.switchToHttp().getRequest()

    return requiredRoles.some((role) => user?.roles?.includes(role))
  }
}
