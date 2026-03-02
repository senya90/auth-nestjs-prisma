import {
  ConflictException,
  Injectable,
  NotFoundException
} from '@nestjs/common'

import { PermissionName, RoleName } from '../../__generated__/enums.js'
import { PrismaService } from '../../prisma/prisma.service.js'
import { AssignRolesDTO } from './dto/assign-roles.dto.js'

@Injectable()
export class RolesService {
  constructor(private readonly prisma: PrismaService) {}

  createPermission(name: PermissionName, description?: string) {
    return this.prisma.permission.create({
      data: {
        name,
        description
      }
    })
  }

  createRole(name: RoleName, description?: string) {
    return this.prisma.role.create({
      data: {
        name,
        description
      }
    })
  }

  async assignPermissionToRole(data: { roleId: string; permissionId: string }) {
    const { permissionId, roleId } = data

    const hasNow = await this.prisma.rolePermission.findUnique({
      where: {
        roleId_permissionId: {
          permissionId,
          roleId
        }
      }
    })

    if (hasNow) {
      throw new ConflictException(
        `Permission ${permissionId} already assigned to the role ${roleId}`
      )
    }

    return this.prisma.rolePermission.create({
      data: { roleId, permissionId }
    })
  }

  async assignRolesToUser(data: AssignRolesDTO) {
    const { userId, rolesIds } = data

    const user = await this.prisma.user.findUnique({
      where: { id: userId }
    })

    if (!user) {
      throw new NotFoundException(`User with id ${userId} not found`)
    }

    const roles = await this.prisma.role.findMany({
      where: { id: { in: rolesIds } }
    })

    if (roles.length !== rolesIds.length) {
      const foundRolesIds = roles.map((r) => r.id)
      const notFoundRolesIds = rolesIds.filter((roleId) =>
        foundRolesIds.includes(roleId)
      )

      throw new NotFoundException(
        `Roles not found: ${notFoundRolesIds.join(', ')}`
      )
    }

    return this.prisma.$transaction(async (tx) => {
      await tx.userRole.deleteMany({
        where: { userId: user.id }
      })

      await tx.userRole.createMany({
        data: rolesIds.map((roleId) => ({
          userId,
          roleId
        }))
      })
    })
  }
}
