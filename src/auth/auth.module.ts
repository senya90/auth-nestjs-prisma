import { Module } from '@nestjs/common'

import { UserModule } from '../user/user.module.js'
import { AuthController } from './auth.controller.js'
import { AuthService } from './auth.service.js'
import { RolesController } from './roles/roles.controller.js'
import { RolesService } from './roles/roles.service.js'

@Module({
  imports: [UserModule],
  controllers: [AuthController, RolesController],
  providers: [AuthService, RolesService]
})
export class AuthModule {}
