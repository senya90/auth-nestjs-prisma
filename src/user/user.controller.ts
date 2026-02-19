import { Controller, Get, HttpCode, HttpStatus, Query } from '@nestjs/common'

import { UserService } from './user.service.js'

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('profile')
  @HttpCode(HttpStatus.OK)
  // @UseGuards(JwtAuthGuard)
  findProfile() {
    // return this.userService.findById(currentUser.id)
  }

  @Get('profile/:id')
  @HttpCode(HttpStatus.OK)
  findProfileById() {}

  @Get('search')
  @HttpCode(HttpStatus.OK)
  findProfileByEmail(@Query('email') email: string) {
    return this.userService.findByEmail(email)
  }
}
