import { createParamDecorator, ExecutionContext } from '@nestjs/common'

import { AuthenticatedRequest } from '../types/authenticated-request.type.js'
import { TokenPayload } from '../types/token-payload.type.js'

export const CurrentUser = createParamDecorator(
  (_: unknown, ctx: ExecutionContext): TokenPayload | undefined => {
    const request = ctx.switchToHttp().getRequest<AuthenticatedRequest>()
    return request.user
  }
)
