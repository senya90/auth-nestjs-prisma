import { createParamDecorator, ExecutionContext } from '@nestjs/common'

import { User } from '../../__generated__/client.js'
import { LoggedRequest } from '../types/logged-request.type.js'

export const LoggedUser = createParamDecorator(
  (_: unknown, ctx: ExecutionContext): User | undefined => {
    const request = ctx.switchToHttp().getRequest<LoggedRequest>()
    return request.user
  }
)
