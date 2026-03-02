import { Module } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'

import { UserModule } from '../user/user.module.js'
import { AuthController } from './auth.controller.js'
import { AuthService } from './auth.service.js'
import { JwtStrategy } from './strategies/jwt.strategy.js'
import { LocalStrategy } from './strategies/local.strategy.js'

@Module({
  imports: [UserModule],
  controllers: [AuthController],
  providers: [AuthService, LocalStrategy, JwtStrategy, JwtService]
})
export class AuthModule {}
