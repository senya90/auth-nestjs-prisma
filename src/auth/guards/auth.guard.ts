import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common'
import { Request } from 'express'

import { UserService } from '../../user/user.service.js'

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly userService: UserService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest()

    if (typeof request.session.userId === 'undefined') {
      throw new UnauthorizedException('The user is not authorized')
    }

    const user = await this.userService.findById(request.session.userId)

    if (!user) {
      throw new UnauthorizedException('User not found')
    }

    request.user = user // todo: ?
    return true
  }
}
