import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException
} from '@nestjs/common'

import type { User } from '../__generated__/client.js'
import { PERMISSION } from '../auth/roles/constants/permissions.constants.js'
import { ROLE, ROLES } from '../auth/roles/constants/roles.constants.js'
import { PrismaService } from '../prisma/prisma.service.js'
import { CreateUser } from './types/create-user.js'

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { id }
    })
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { email }
    })
  }

  async create(params: CreateUser): Promise<User> {
    const existingUser = await this.findByEmail(params.email)
    if (existingUser) {
      throw new ConflictException('Email already exists')
    }

    const guestRole = await this.prisma.role.findUnique({
      where: { id: ROLES.IDS.GUEST }
    })

    if (!guestRole) {
      throw new NotFoundException('Default role Guest not found')
    }

    const { passwordHash, ...userData } = params

    return await this.prisma.user.create({
      data: {
        email: userData.email,
        method: userData.method,
        displayName: userData.displayName ?? userData.email,
        picture: userData.picture ?? '',
        isVerified: userData.isVerified ?? false,
        ...(passwordHash && {
          password: {
            create: { passwordHash }
          }
        }),
        userRoles: {
          create: {
            roleId: guestRole.id
          }
        }
      }
    })
  }

  async getUserRoles(
    userId: string
  ): Promise<
    { id: string; name: string; permissions: { id: string; name: string }[] }[]
  > {
    const userRoles = await this.prisma.userRole.findMany({
      where: { userId },
      select: {
        role: {
          select: {
            id: true,
            name: true,
            rolePermissions: {
              select: {
                permission: {
                  select: {
                    id: true,
                    name: true
                  }
                }
              }
            }
          }
        }
      }
    })

    return userRoles.map((ur) => ({
      id: ur.role.id,
      name: ur.role.name as ROLE,
      permissions: ur.role.rolePermissions.map((rp) => ({
        id: rp.permission.id,
        name: rp.permission.name as PERMISSION
      }))
    }))
  }

  async assignRole(
    userId: string,
    role: { roleName?: string; roleId?: string }
  ): Promise<void> {
    const hasField = role?.roleId || role?.roleName
    if (!hasField) {
      throw new BadRequestException('No data to assign a role to the user')
    }

    const { roleId, roleName } = role

    const targetRole = roleId
      ? await this.prisma.role.findUnique({ where: { id: roleId } })
      : await this.prisma.role.findUnique({ where: { name: roleName } })

    if (!targetRole) throw new NotFoundException('Role not found')

    await this.prisma.userRole.create({
      data: {
        userId,
        roleId: targetRole.id
      }
    })
  }
}
