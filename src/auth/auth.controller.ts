import { Body, Controller, HttpCode, HttpStatus, Post, Req, Res, UseGuards } from '@nestjs/common'
import type { Request, Response } from 'express'

import type { User } from '../__generated__/client.js'
import { ValidationGuard } from '../common/guards/validation.guard.js'
import { AuthService } from './auth.service.js'
import { CurrentUser } from './decorators/current-user.decorator.js'
import { LoginDTO } from './dto/login.dto.js'
import { RegisterDTO } from './dto/register.dto.js'
import { LocalAuthGuard } from './guards/local-auth.guard.js'

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  async register(@Body() dto: RegisterDTO) {
    return this.authService.register(dto)
  }

  @UseGuards(new ValidationGuard(LoginDTO), LocalAuthGuard)
  @Post('login')
  async login(@CurrentUser() user: User) {
    return this.authService.login(user)
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  async logout(@Req() request: Request, @Res() response: Response) {
    return this.authService.logout(request, response)
  }
}
