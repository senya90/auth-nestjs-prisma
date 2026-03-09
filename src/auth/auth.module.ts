import { Module } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'

import { MailService } from '../mail/mail.service.js'
import { UserModule } from '../user/user.module.js'
import { AuthController } from './auth.controller.js'
import { AuthService } from './auth.service.js'
import { GithubOAuthGuard } from './guards/github-oauth.guard.js'
import { GoogleOAuthGuard } from './guards/google-oauth.guard.js'
import { YandexOAuthGuard } from './guards/yandex-oauth.guard.js'
import { HashGeneratorService } from './hash-generator.service.js'
import { PasswordResetService } from './password-reset.service.js'
import { GithubStrategy } from './strategies/github.strategy.js'
import { GoogleStrategy } from './strategies/google.strategy.js'
import { JwtStrategy } from './strategies/jwt.strategy.js'
import { LocalStrategy } from './strategies/local.strategy.js'
import { YandexStrategy } from './strategies/yandex.strategy.js'
import { VerificationService } from './verification.service.js'

@Module({
  imports: [UserModule],
  controllers: [AuthController],
  providers: [
    AuthService,
    LocalStrategy,
    JwtStrategy,
    JwtService,
    GoogleStrategy,
    GoogleOAuthGuard,
    GithubStrategy,
    GithubOAuthGuard,
    YandexStrategy,
    YandexOAuthGuard,
    VerificationService,
    HashGeneratorService,
    MailService,
    PasswordResetService
  ]
})
export class AuthModule {}
