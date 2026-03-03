import { Injectable, UnauthorizedException } from '@nestjs/common'
import { PassportStrategy } from '@nestjs/passport'
import { Strategy } from 'passport-local'

import { User } from '../../__generated__/client.js'
import { AuthService } from '../auth.service.js'

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy, 'local') {
  constructor(private readonly authService: AuthService) {
    super({ usernameField: 'email' })
  }

  async validate(email: string, password: string): Promise<User | null> {
    const user = await this.authService.validateUser(email, password)

    if (!user) {
      throw new UnauthorizedException('Invalid email or password')
    }
    return user
  }
}
