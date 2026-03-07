import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Logger,
  NotFoundException,
  Post,
  Query,
  Req,
  Res,
  UnauthorizedException,
  UseGuards
} from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import type { Response } from 'express'

import type { User } from '../__generated__/client.js'
import { ValidationGuard } from '../common/guards/validation.guard.js'
import { IS_PROD_ENV } from '../common/utils/is-dev.util.js'
import { UserService } from './../user/user.service.js'
import { AuthService } from './auth.service.js'
import { COOKIE_TYPE } from './constants/cookie-type.js'
import { CurrentUser } from './decorators/current-user.decorator.js'
import { LoggedUser } from './decorators/login-user.decorator.js'
import { LoginDTO } from './dto/login.dto.js'
import { RegisterDTO } from './dto/register.dto.js'
import { CsrfGuard } from './guards/csrf.guard.js'
import { GithubOAuthGuard } from './guards/github-oauth.guard.js'
import { GoogleOAuthGuard } from './guards/google-oauth.guard.js'
import { JwtAuthGuard } from './guards/jwt-auth.guard.js'
import { LocalAuthGuard } from './guards/local-auth.guard.js'
import { YandexOAuthGuard } from './guards/yandex-oauth.guard.js'
import type { AuthenticatedRequest } from './types/authenticated-request.type.js'
import { GithubProfile } from './types/github-profile.type.js'
import { GoogleProfile } from './types/google-profile.type.js'
import type { TokenPayload } from './types/token-payload.type.js'
import { YandexProfile } from './types/yandex-profile.type.js'
import { VerificationService } from './verification.service.js'

@Controller('auth')
export class AuthController {
  private readonly logger = new Logger(AuthController.name)
  private readonly accessTokenTTL: number
  private readonly refreshTokenTTL: number
  private readonly cookieBufferTTL: number
  private readonly frontendUrl: string

  constructor(
    private readonly authService: AuthService,
    private readonly userService: UserService,
    private readonly verificationService: VerificationService,
    private readonly configService: ConfigService
  ) {
    this.accessTokenTTL = Number(
      this.configService.getOrThrow<number>('JWT_ACCESS_TTL')
    )
    this.refreshTokenTTL = Number(
      this.configService.getOrThrow<number>('JWT_REFRESH_TTL')
    )
    this.cookieBufferTTL = Number(
      this.configService.getOrThrow<number>('COOKIE_BUFFER')
    )
    this.frontendUrl = this.configService.getOrThrow<string>('FRONTEND_URL')
  }

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  async register(@Body() dto: RegisterDTO) {
    return this.authService.register(dto)
  }

  @UseGuards(new ValidationGuard(LoginDTO), LocalAuthGuard)
  @Post('login')
  async login(
    @LoggedUser() user: User,
    @Res({ passthrough: true }) res: Response
  ) {
    const { accessToken, refreshToken, csrfToken } =
      await this.authService.login(user.id)
    this.setTokenCookies(res, { accessToken, refreshToken, csrfToken })

    return { message: 'Login', userId: user.id }
  }

  @Get('google')
  @UseGuards(GoogleOAuthGuard)
  async googleAuth() {}

  @Get('google/callback')
  @UseGuards(GoogleOAuthGuard)
  async googleCallback(
    @Req() req: Request & { user: GoogleProfile },
    @Res() res: Response
  ) {
    const { accessToken, refreshToken, csrfToken } =
      await this.authService.googleLogin(req.user)

    this.setTokenCookies(res, { accessToken, refreshToken, csrfToken })
    this.redirectToFrontend(res)
  }

  @Get('github')
  @UseGuards(GithubOAuthGuard)
  async githubAuth() {}

  @Get('github/callback')
  @UseGuards(GithubOAuthGuard)
  async githubCallback(
    @Req() req: Request & { user: GithubProfile },
    @Res() res: Response
  ) {
    const { accessToken, refreshToken, csrfToken } =
      await this.authService.githubLogin(req.user)

    this.setTokenCookies(res, { accessToken, refreshToken, csrfToken })
    this.redirectToFrontend(res)
  }

  @Get('yandex')
  @UseGuards(YandexOAuthGuard)
  async yandexAuth() {}

  @Get('yandex/callback')
  @UseGuards(YandexOAuthGuard)
  async yandexCallback(
    @Req() req: Request & { user: YandexProfile },
    @Res() res: Response
  ) {
    const { accessToken, refreshToken, csrfToken } =
      await this.authService.yandexLogin(req.user)

    this.setTokenCookies(res, { accessToken, refreshToken, csrfToken })
    this.redirectToFrontend(res)
  }

  @Post('logout')
  async logout(
    @Req() req: AuthenticatedRequest,
    @Res({ passthrough: true }) res: Response,
    @CurrentUser() user: TokenPayload
  ) {
    const refreshToken = req.cookies[COOKIE_TYPE.REFRESH_TOKEN]

    if (refreshToken) {
      await this.authService.logout(user.sub, refreshToken)
    }

    this.clearTokenCookies(res)

    return { message: 'Logout ' }
  }

  @UseGuards(JwtAuthGuard, CsrfGuard)
  @Post('refresh')
  async refresh(
    @Req() req: AuthenticatedRequest,
    @Res({ passthrough: true }) res: Response
  ) {
    const oldRefreshToken = req.cookies?.refresh_token

    if (!oldRefreshToken) {
      throw new UnauthorizedException('Refresh token not found')
    }

    const { accessToken, refreshToken, csrfToken } =
      await this.authService.refresh(oldRefreshToken)

    this.setTokenCookies(res, { accessToken, refreshToken, csrfToken })

    return { message: 'Tokens refreshed', userId: req.user?.sub }
  }

  @Post('send-verification')
  @UseGuards(JwtAuthGuard)
  async sendVerification(@Req() req: AuthenticatedRequest) {
    if (!req.user) {
      const message = 'User not found in token'
      this.logger.warn(message)
      throw new NotFoundException(message)
    }

    const user = await this.userService.findById(req.user.sub)

    if (!user) {
      const message = 'User not found'
      this.logger.warn(message)
      throw new NotFoundException(message)
    }

    if (user.isVerified) {
      const message = 'Email already verified'
      this.logger.warn(message)
      throw new BadRequestException(message)
    }

    await this.verificationService.sendVerificationEmail(user.id, user.email)

    const message = 'Verification email sent'
    this.logger.verbose(message)
    return { message }
  }

  @Get('verify-email')
  async verifyEmail(@Query('token') token: string, @Res() res: Response) {
    await this.verificationService.verifyEmail(token)

    res.redirect(`${this.frontendUrl}/auth/email-verified`)
  }

  private setTokenCookies(
    res: Response,
    tokens: {
      accessToken: string
      refreshToken: string
      csrfToken: string
    }
  ) {
    const { accessToken, refreshToken, csrfToken } = tokens

    res.cookie(COOKIE_TYPE.ACCESS_TOKEN, accessToken, {
      httpOnly: true,
      secure: IS_PROD_ENV,
      sameSite: 'lax',
      path: '/',
      maxAge: this.accessTokenTTL + this.cookieBufferTTL
    })

    res.cookie(COOKIE_TYPE.REFRESH_TOKEN, refreshToken, {
      httpOnly: true,
      secure: IS_PROD_ENV,
      sameSite: 'lax',
      path: '/auth/refresh',
      maxAge: this.refreshTokenTTL + this.cookieBufferTTL
    })

    res.cookie(COOKIE_TYPE.CSRF_TOKEN, csrfToken, {
      httpOnly: false,
      secure: IS_PROD_ENV,
      sameSite: 'lax',
      path: '/',
      maxAge: this.refreshTokenTTL + this.cookieBufferTTL
    })
  }

  private clearTokenCookies(res: Response) {
    res.clearCookie(COOKIE_TYPE.ACCESS_TOKEN)
    res.clearCookie(COOKIE_TYPE.REFRESH_TOKEN)
    res.clearCookie(COOKIE_TYPE.CSRF_TOKEN)
  }

  private redirectToFrontend(res: Response) {
    res.redirect(this.frontendUrl)
  }
}
