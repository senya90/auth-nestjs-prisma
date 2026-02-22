import { Injectable, UnauthorizedException } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { PassportStrategy } from '@nestjs/passport'
import { Request } from 'express'
import { ExtractJwt, Strategy } from 'passport-jwt'

import { UserService } from '../../user/user.service.js'
import { AuthenticatedRequest } from '../types/authenticated-request.type.js'
import { TokenPayload, TokenPayloadFull } from '../types/token-payload.type.js'

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    private readonly configService: ConfigService,
    private readonly userService: UserService
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (request: AuthenticatedRequest) => {
          return request?.cookies?.access_token ?? null
        }
      ]),
      ignoreExpiration: false,
      secretOrKey: configService.getOrThrow<string>('JWT_SECRET')
    })
  }

  async validate(payload: TokenPayloadFull) {
    const user = await this.userService.findById(payload.sub)

    if (!user) {
      throw new UnauthorizedException()
    }

    const tokenPayload: TokenPayload = {
      sub: payload.sub,
      roles: payload.roles.map((role) => ({
        id: role.id,
        name: role.name
      }))
    }

    return tokenPayload
  }
}
