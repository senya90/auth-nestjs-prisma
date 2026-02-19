import { ConflictException, Injectable } from '@nestjs/common'

import type { User } from '../__generated__/client.js'
import { AuthMethod } from '../__generated__/enums.js'
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
          include: {
            role: {
              include: {
                rolePermissions: true
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
          include: {
            role: {
              include: {
                rolePermissions: true
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
    const { email, passwordHash, displayName, isVerified, method, picture } = params
    const existingUser = await this.findByEmail(email)
    if (existingUser) {
      throw new ConflictException('Email already exists')
    }

    return this.prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email,
          displayName,
          picture,
          method,
          isVerified
        }
      })

      await tx.password.create({
        data: {
          userId: user.id,
          passwordHash
        }
      })

      return user
    })
  }

  async findPasswordByUserId(userId: string) {
    return this.prisma.password.findUnique({
      where: { userId }
    })
  }
}
