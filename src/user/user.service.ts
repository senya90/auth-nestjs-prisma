import { ConflictException, Injectable, NotFoundException } from '@nestjs/common'

import type { User } from '../__generated__/client.js'
import { AuthMethod } from '../__generated__/enums.js'
import { ROLES } from '../auth/roles/constants/roles.constants.js'
import { PrismaService } from '../prisma/prisma.service.js'

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { id },
      include: {
        accounts: true,
        userRoles: {
          select: {
            role: {
              select: {
                name: true,
                rolePermissions: {
                  select: {
                    permission: {
                      select: {
                        name: true
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    })
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { email },
      include: {
        accounts: true,
        userRoles: {
          select: {
            role: {
              select: {
                name: true,
                rolePermissions: {
                  select: {
                    permission: {
                      select: {
                        name: true
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    })
  }

  async create(params: {
    email: string
    passwordHash: string
    displayName: string
    picture: string
    method: AuthMethod
    isVerified: boolean
  }): Promise<User> {
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
        displayName: userData.displayName,
        picture: userData.picture ?? '',
        method: userData.method,
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
}
