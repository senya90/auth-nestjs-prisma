import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common'
import { Reflector } from '@nestjs/core'

import { UserRole } from '../../__generated__/enums.js'
import { ROLES_KEY } from '../decorators/roles.decorator.js'

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const roles = this.reflector.getAllAndOverride<UserRole[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass()
    ])
    const request = context.switchToHttp().getRequest()

    if (!roles) return true

    if (!roles.includes(request.user.role)) {
      throw new ForbiddenException('No access rights for user role')
    }

    return true
  }
}
