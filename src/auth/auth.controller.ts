import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
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
import { AuthService } from './auth.service.js'
import { COOKIE_TYPE } from './constants/cookie-type.js'
import { CurrentUser } from './decorators/current-user.decorator.js'
import { LoginDTO } from './dto/login.dto.js'
import { RegisterDTO } from './dto/register.dto.js'
import { JwtAuthGuard } from './guards/jwt-auth.guard.js'
import { LocalAuthGuard } from './guards/local-auth.guard.js'
import type { AuthenticatedRequest } from './types/authenticated-request.type.js'
import type { TokenPayload } from './types/token-payload.type.js'

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService
  ) {}

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  async register(@Body() dto: RegisterDTO) {
    return this.authService.register(dto)
  }

  @UseGuards(new ValidationGuard(LoginDTO), LocalAuthGuard)
  @Post('login')
  async login(
    @CurrentUser() user: User,
    @Res({ passthrough: true }) res: Response
  ) {
    const { accessToken, refreshToken } = await this.authService.login(user)
    this.setTokenCookies(res, accessToken, refreshToken)

    return { message: 'Login' }
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

    res.clearCookie(COOKIE_TYPE.ACCESS_TOKEN)
    res.clearCookie(COOKIE_TYPE.REFRESH_TOKEN)

    return { message: 'Logout ' }
  }

  @UseGuards(JwtAuthGuard)
  @Post('refresh')
  async refresh(
    @Req() req: AuthenticatedRequest,
    @Res({ passthrough: true }) res: Response
  ) {
    const oldRefreshToken = req.cookies?.refresh_token

    if (!oldRefreshToken) {
      throw new UnauthorizedException('Refresh token not found')
    }

    const { accessToken, refreshToken } =
      await this.authService.refresh(oldRefreshToken)

    this.setTokenCookies(res, accessToken, refreshToken)

    return { message: 'Tokens refreshed' }
  }

  private setTokenCookies(
    res: Response,
    accessToken: string,
    refreshToken: string
  ) {
    const ACCESS_TOKEN_TTL = Number(
      this.configService.getOrThrow<number>('JWT_ACCESS_TTL')
    )
    const REFRESH_TOKEN_TTL = Number(
      this.configService.getOrThrow<number>('JWT_REFRESH_TTL')
    )
    const COOKIE_BUFFER = Number(
      this.configService.getOrThrow<number>('COOKIE_BUFFER')
    )

    res.cookie(COOKIE_TYPE.ACCESS_TOKEN, accessToken, {
      httpOnly: true,
      secure: IS_PROD_ENV,
      sameSite: 'lax',
      maxAge: ACCESS_TOKEN_TTL + COOKIE_BUFFER
    })

    res.cookie(COOKIE_TYPE.REFRESH_TOKEN, refreshToken, {
      httpOnly: true,
      secure: IS_PROD_ENV,
      sameSite: 'lax',
      path: '/auth/refresh',
      maxAge: REFRESH_TOKEN_TTL + COOKIE_BUFFER
    })
  }
}
