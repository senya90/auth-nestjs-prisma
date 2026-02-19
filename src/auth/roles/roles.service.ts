import { Injectable } from '@nestjs/common'

import { PrismaService } from '../../prisma/prisma.service.js'

@Injectable()
export class RolesService {
  constructor(private readonly prisma: PrismaService) {}

  createPermission(name: string, description?: string) {
    return this.prisma.permission.create({
      data: {
        name,
        description
      }
    })
  }

  createRole(name: string, description?: string) {
    return this.prisma.role.create({
      data: {
        name,
        description
      }
    })
  }

  async assignPermissionToRole(data: { roleId: string; permissionId: string }) {
    const { permissionId, roleId } = data

    return this.prisma.rolePermission.create({
      data: { roleId, permissionId }
    })
  }
}
