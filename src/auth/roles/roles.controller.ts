import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common'

import { AssignPermissionDTO } from './dto/assign-permission.dto.js'
import { CreatePermissionDTO } from './dto/create-permission.dto.js'
import { CreateRoleDTO } from './dto/create-role.dto.js'
import { RolesService } from './roles.service.js'

@Controller('roles')
export class RolesController {
  constructor(private readonly roleService: RolesService) {}

  @Post('create-permission')
  @HttpCode(HttpStatus.CREATED)
  async createPermission(@Body() dto: CreatePermissionDTO) {
    return this.roleService.createPermission(dto.name, dto.description)
  }

  @Post('create-role')
  @HttpCode(HttpStatus.OK)
  async createRole(@Body() dto: CreateRoleDTO) {
    return this.roleService.createRole(dto.name, dto.description)
  }

  @Post('assign-permission')
  @HttpCode(HttpStatus.OK)
  async assignPermission(@Body() dto: AssignPermissionDTO) {
    try {
      await this.roleService.assignPermissionToRole({
        roleId: dto.roleId,
        permissionId: dto.permissionId
      })

      return
    } catch (e) {
      return e
    }
  }
}
