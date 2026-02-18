import { Body, Controller, HttpCode, HttpStatus, Post, Req, Res } from '@nestjs/common'
import type { Request, Response } from 'express'

import { AuthService } from './auth.service.js'
import { LoginDTO } from './dto/login.dto.js'
import { RegisterDTO } from './dto/register.dto.js'

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  async register(@Req() request: Request, @Body() dto: RegisterDTO) {
    return this.authService.register(request, dto)
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Req() request: Request, @Body() dto: LoginDTO) {
    return this.authService.login(request, dto)
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  async logout(@Req() request: Request, @Res() response: Response) {
    return this.authService.logout(request, response)
  }
}
