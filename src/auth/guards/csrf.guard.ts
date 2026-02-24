import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable
} from '@nestjs/common'

interface CsrfRequest extends Request {
  cookies: { csrf_token?: string }
}

@Injectable()
export class CsrfGuard implements CanActivate {
  canActivate(ctx: ExecutionContext): boolean {
    const request = ctx.switchToHttp().getRequest<CsrfRequest>()

    const csrfCookie = request.cookies?.csrf_token
    const csrfHeader = request.headers['x-csrf-token']

    if (!csrfCookie || csrfCookie !== csrfHeader) {
      throw new ForbiddenException('Invalid CSRF token')
    }

    return true
  }
}
