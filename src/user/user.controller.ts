import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Query,
  UseGuards
} from '@nestjs/common'

import { CurrentUser } from '../auth/decorators/current-user.decorator.js'
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js'
import type { TokenPayload } from '../auth/types/token-payload.type.js'
import { UserService } from './user.service.js'

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  findProfile(@CurrentUser() user: TokenPayload) {
    return this.userService.findById(user.sub)
  }

  @Get('profile/:id')
  @HttpCode(HttpStatus.OK)
  findProfileById() {}

  @Get('search')
  @HttpCode(HttpStatus.OK)
  findProfileByEmail(@Query('email') email: string) {
    return this.userService.findByEmail(email)
  }

  @Get('roles')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  getUserRoles(@Query('user_id') userId: string) {
    return this.userService.getUserRoles(userId)
  }
}
