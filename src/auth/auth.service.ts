import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
  UnauthorizedException
} from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { JwtService } from '@nestjs/jwt'
import bcrypt from 'bcrypt'
import { createHash, randomBytes } from 'crypto'
import type { Request, Response } from 'express'

import { AuthMethod, Password, User } from '../__generated__/client.js'
import { msToSeconds } from '../common/utils/time/ms-to-seconds.js'
import { PrismaService } from '../prisma/prisma.service.js'
import { UserService } from '../user/user.service.js'
import { RegisterDTO } from './dto/register.dto.js'
import { ROLE } from './roles/constants/roles.constants.js'
import { TokenPayload } from './types/token-payload.type.js'

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name)

  constructor(
    private readonly userService: UserService,
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService
  ) {}

  async register(dto: RegisterDTO): Promise<User> {
    const user = await this.userService.findByEmail(dto.email)

    if (user) {
      throw new ConflictException('A user with this email already exists.')
    }

    const { email, name, password } = dto
    const newUser = await this.userService.create({
      email,
      displayName: name,
      passwordHash: password ? await this.hashPassword(password) : '',
      isVerified: false,
      method: 'CREDENTIALS',
      picture: ''
    })

    return newUser
  }

  async login(
    user: User
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const roles = await this.userService.getUserRoles(user.id)
    const accessTTLMs = Number(
      this.configService.getOrThrow<number>('JWT_ACCESS_TTL')
    )
    const refreshTTLMs = Number(
      this.configService.getOrThrow<number>('JWT_REFRESH_TTL')
    )

    const tokenPayload: TokenPayload = {
      sub: user.id,
      roles: roles.map((role) => ({
        id: role.id,
        name: role.name as ROLE
      }))
    }

    const accessToken = this.jwtService.sign(tokenPayload, {
      secret: this.configService.getOrThrow('JWT_SECRET'),
      expiresIn: msToSeconds(accessTTLMs)
    })

    const { refreshToken, refreshTokenHash } = this.generateRefreshToken()

    await this.prisma.refreshToken.create({
      data: {
        expiresAt: new Date(Date.now() + refreshTTLMs),
        token: refreshTokenHash,
        userId: user.id
      }
    })

    return { accessToken, refreshToken }
  }

  async logout(userId: string, refreshToken: string): Promise<void> {
    const hashed = this.hashCrypto(refreshToken)

    await this.prisma.refreshToken.deleteMany({
      where: {
        token: hashed,
        userId
      }
    })
  }

  async validateUser(email: string, password: string): Promise<User | null> {
    const user = await this.userService.findByEmail(email)

    if (!user) return null
    if (user.method !== AuthMethod.CREDENTIALS) return null

    const userPassword = await this.getUserPassword(user.id)
    if (!userPassword?.passwordHash) return null

    const isMatch = await this.validatePassword(
      password,
      userPassword.passwordHash
    )

    if (!isMatch) return null
    return user
  }

  async refresh(oldRefreshToken: string) {
    const hashed = this.hashCrypto(oldRefreshToken)
    const tokenRecord = await this.prisma.refreshToken.findUnique({
      where: { token: hashed }
    })

    if (!tokenRecord || tokenRecord.expiresAt < new Date()) {
      throw new UnauthorizedException('Invalid or expired refresh token')
    }

    const user = await this.userService.findById(tokenRecord.userId)

    if (!user) {
      throw new NotFoundException(
        'The user was not found when updating the token.'
      )
    }

    await this.prisma.refreshToken.delete({
      where: { token: hashed }
    })

    return this.login(user)
  }

  private hashPassword(password: string): Promise<string> {
    const saltRounds = Number(
      this.configService.getOrThrow<number>('SALT_ROUNDS')
    )

    return bcrypt.hash(password, saltRounds)
  }

  private hashCrypto(value: string): string {
    const alrogithm =
      this.configService.getOrThrow<string>('CRYPTO_ALGORITHM') ?? 'sha256'

    return createHash(alrogithm).update(value).digest('hex')
  }

  private async validatePassword(
    password: string,
    hash: string | undefined | null
  ): Promise<boolean> {
    if (!hash) return false

    return bcrypt.compare(password, hash)
  }

  private async getUserPassword(userId: string): Promise<Password | null> {
    return this.prisma.password.findUnique({
      where: { userId }
    })
  }

  private generateRefreshToken(): {
    refreshToken: string
    refreshTokenHash: string
  } {
    const refreshToken = randomBytes(64).toString('base64url')
    const refreshTokenHash = this.hashCrypto(refreshToken)

    return {
      refreshToken,
      refreshTokenHash
    }
  }
}
