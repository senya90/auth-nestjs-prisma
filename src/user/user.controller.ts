import { Controller, Get, HttpCode, HttpStatus } from '@nestjs/common'

import { UserService } from './user.service.js'

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('profile')
  @HttpCode(HttpStatus.OK)
  findProfile() {}

  @Get('profile/:id')
  @HttpCode(HttpStatus.OK)
  findProfileById() {}
}
