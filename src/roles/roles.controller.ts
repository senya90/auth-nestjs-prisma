import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Put,
  UseGuards
} from '@nestjs/common'

import { CsrfGuard } from '../auth/guards/csrf.guard.js'
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js'
import { Roles } from './decorators/roles.decorator.js'
import { AssignPermissionDTO } from './dto/assign-permission.dto.js'
import { AssignRolesDTO } from './dto/assign-roles.dto.js'
import { CreatePermissionDTO } from './dto/create-permission.dto.js'
import { CreateRoleDTO } from './dto/create-role.dto.js'
import { RolesGuard } from './guards/roles.guard.js'
import { RolesService } from './roles.service.js'

@Controller('roles')
export class RolesController {
  constructor(private readonly roleService: RolesService) {}

  @Post('create-permission')
  @UseGuards(JwtAuthGuard, RolesGuard, CsrfGuard)
  @Roles('ADMIN')
  @HttpCode(HttpStatus.CREATED)
  async createPermission(@Body() dto: CreatePermissionDTO) {
    return this.roleService.createPermission(dto.name, dto.description)
  }

  @Post('create-role')
  @UseGuards(JwtAuthGuard, RolesGuard, CsrfGuard)
  @Roles('ADMIN')
  @HttpCode(HttpStatus.CREATED)
  async createRole(@Body() dto: CreateRoleDTO) {
    return this.roleService.createRole(dto.name, dto.description)
  }

  @Put('assign-permission')
  @UseGuards(JwtAuthGuard, RolesGuard, CsrfGuard)
  @Roles('ADMIN')
  @HttpCode(HttpStatus.OK)
  async assignPermission(@Body() dto: AssignPermissionDTO) {
    return await this.roleService.assignPermissionToRole(dto)
  }

  @Put('assign-roles')
  @UseGuards(JwtAuthGuard, RolesGuard, CsrfGuard)
  @Roles('ADMIN', 'MODERATOR')
  @HttpCode(HttpStatus.OK)
  async assignRoles(@Body() dto: AssignRolesDTO) {
    return await this.roleService.assignRolesToUser(dto)
  }
}
