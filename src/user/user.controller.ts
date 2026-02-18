import { Controller, Get, HttpCode, HttpStatus, Param } from '@nestjs/common'

import { Authorization } from '../auth/decorators/auth.decorator.js'
import { Authorized } from '../auth/decorators/authorized.decorator.js'
import { UserService } from './user.service.js'

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('profile')
  @Authorization()
  @HttpCode(HttpStatus.OK)
  findProfile(@Authorized('id') userId: string) {
    return this.userService.findById(userId)
  }

  @Get('profile/:id')
  @Authorization()
  @HttpCode(HttpStatus.OK)
  findProfileById(@Param('id') userId: string) {
    return this.userService.findById(userId)
  }
}
