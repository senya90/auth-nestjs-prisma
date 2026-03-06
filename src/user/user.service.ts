import {
  BadRequestException,
  ConflictException,
  Injectable,
  Logger,
  NotFoundException
} from '@nestjs/common'

import type {
  AuthMethod,
  OAuthProvider,
  PermissionName,
  RoleName,
  User
} from '../__generated__/client.js'
import { sliceToken } from '../common/utils/token-slicer.util.js'
import { PrismaService } from '../prisma/prisma.service.js'
import { ROLES } from '../roles/constants/roles.constants.js'
import { CreateUser } from './types/create-user.js'

@Injectable()
export class UserService {
  private readonly logger = new Logger(UserService.name)

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
    const { passwordHash, ...userData } = params
    this.logger.log(`Create user. ${JSON.stringify(userData)}`)

    const existingUser = await this.findByEmail(params.email)
    if (existingUser) {
      const message = 'Email already exists'
      this.logger.warn(message)
      throw new ConflictException(message)
    }

    const guestRole = await this.prisma.role.findUnique({
      where: { id: ROLES.IDS.GUEST }
    })

    if (!guestRole) {
      const message = 'Default role Guest not found'
      this.logger.error(message)
      throw new NotFoundException(message)
    }

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

  async findOrCreateOAuthUser(
    authMethod: AuthMethod,
    params: {
      email: string
      displayName: string
      picture: string
      provider: OAuthProvider
      providerId: string
      accessToken?: string
      refreshToken?: string | null
    }
  ): Promise<User | null> {
    const {
      provider,
      providerId,
      accessToken,
      refreshToken,
      displayName,
      email,
      picture
    } = params

    this.logger.debug(
      `Find or create OAuth user. provider: ${provider}, providerId: ${providerId}, email: ${email}`
    )

    const existingAccount = await this.prisma.account.findUnique({
      where: { provider_providerId: { provider, providerId } },
      include: { user: true }
    })

    if (existingAccount) {
      this.logger.debug(`Existing account ${existingAccount.id}`)

      await this.prisma.account.update({
        where: { id: existingAccount.id },
        data: {
          expiresAt: new Date(Date.now() + 3600 * 1000) // 1h
        }
      })

      this.logger.log(
        `Account has been updated ${existingAccount.id}. accessToken: ${sliceToken(accessToken)}, refreshToken: ${sliceToken(refreshToken)}`
      )

      return existingAccount.user
    }
    this.logger.debug('Existing account not found')

    const existingUser = await this.findByEmail(email)

    if (existingUser) {
      this.logger.debug(`Existing user ${existingUser.id}`)

      const acc = await this.prisma.account.create({
        data: {
          userId: existingUser.id,
          provider,
          providerId,
          expiresAt: new Date(Date.now() + 3600 * 1000)
        }
      })
      this.logger.log(
        `An account ${acc.id} was created for the user ${existingUser.id}`
      )

      return existingUser
    }
    this.logger.debug('Existing user not found')

    const guestRole = await this.prisma.role.findUnique({
      where: { id: ROLES.IDS.GUEST }
    })

    if (!guestRole) {
      const message = 'Default role Guest not found'
      this.logger.error(message)
      throw new NotFoundException(message)
    }

    const user = await this.prisma.user.create({
      data: {
        email,
        displayName,
        picture,
        method: authMethod,
        isVerified: true,
        accounts: {
          create: {
            provider,
            providerId,
            expiresAt: new Date(Date.now() + 3600 * 1000)
          }
        },
        userRoles: {
          create: { roleId: guestRole.id }
        }
      }
    })

    this.logger.log(`OAuth user ${user.id} was created. Provider: ${provider}`)
    return user
  }

  async getUserRoles(userId: string): Promise<
    {
      id: string
      name: RoleName
      permissions: { id: string; name: PermissionName }[]
    }[]
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
      name: ur.role.name,
      permissions: ur.role.rolePermissions.map((rp) => ({
        id: rp.permission.id,
        name: rp.permission.name
      }))
    }))
  }

  async assignRole(
    userId: string,
    role: { roleName?: RoleName; roleId?: string }
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
