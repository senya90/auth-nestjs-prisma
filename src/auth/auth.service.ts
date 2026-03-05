import {
  ConflictException,
  Injectable,
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
import { sliceToken } from '../common/utils/token-slicer.util.js'
import { PrismaService } from '../prisma/prisma.service.js'
import { UserService } from '../user/user.service.js'
import { RegisterDTO } from './dto/register.dto.js'
import { GithubProfile } from './types/github-profile.type.js'
import { GoogleProfile } from './types/google-profile.type.js'
import { TokenPayload } from './types/token-payload.type.js'
import { YandexProfile } from './types/yandex-profile.type.js'

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
      const message = 'A user with this email already exists'
      this.logger.warn(message)
      throw new ConflictException(message)
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

    this.logger.log(`User created. ${JSON.stringify(newUser)}`)

    return newUser
  }

  async login(
    userId: string
  ): Promise<{ accessToken: string; refreshToken: string; csrfToken: string }> {
    this.logger.log(`Login attempt, user: ${userId}`)

    const roles = await this.userService.getUserRoles(userId)
    const accessTTLMs = Number(
      this.configService.getOrThrow<number>('JWT_ACCESS_TTL')
    )
    const refreshTTLMs = Number(
      this.configService.getOrThrow<number>('JWT_REFRESH_TTL')
    )

    const tokenPayload: TokenPayload = {
      sub: userId,
      roles: roles.map((role) => ({
        id: role.id,
        name: role.name,
        permissions: role.permissions.map((p) => {
          return {
            id: p.id,
            name: p.name
          }
        })
      }))
    }

    const accessToken = this.jwtService.sign(tokenPayload, {
      secret: this.configService.getOrThrow('JWT_SECRET'),
      expiresIn: msToSeconds(accessTTLMs)
    })

    const { token: refreshToken, tokenHash: refreshTokenHash } =
      this.generateTokenWithHash()

    const { token: csrfToken } = this.generateTokenWithHash()

    this.logger.log(`Create refresh token. userId: ${userId}`)
    this.logger.debug(`access: ${sliceToken(accessToken)}`)
    this.logger.debug(`refreshToken: ${sliceToken(refreshToken)}`)
    this.logger.debug(`csrfToken: ${sliceToken(csrfToken)}`)

    await this.prisma.refreshToken.create({
      data: {
        expiresAt: new Date(Date.now() + refreshTTLMs),
        token: refreshTokenHash,
        userId
      }
    })

    return { accessToken, refreshToken, csrfToken }
  }

  async googleLogin(profile: GoogleProfile) {
    const { accessToken, refreshToken, displayName, email, googleId, picture } =
      profile

    this.logger.verbose(`Google login. email: ${email}, googleId: ${googleId}`)

    const user = await this.userService.findOrCreateOAuthUser('GOOGLE', {
      email,
      displayName,
      picture,
      provider: 'google',
      providerId: googleId,
      accessToken,
      refreshToken
    })

    if (!user) {
      const message = `Google login. User not found. googleId: ${googleId}`
      this.logger.warn(message)
      throw new NotFoundException(message)
    }

    return this.login(user.id)
  }

  async githubLogin(profile: GithubProfile) {
    const { displayName, email, githubId, picture } = profile
    this.logger.verbose(`Github login. email: ${email}, githubId: ${githubId}`)

    const user = await this.userService.findOrCreateOAuthUser('GITHUB', {
      email,
      displayName,
      picture,
      provider: 'github',
      providerId: githubId
    })

    if (!user) {
      const message = `Github login. User not found. githubId: ${githubId}`
      this.logger.warn(message)
      throw new NotFoundException(message)
    }

    return this.login(user.id)
  }

  async yandexLogin(profile: YandexProfile) {
    const { displayName, email, picture, yandexId } = profile
    this.logger.verbose(`Yandex login. email: ${email}, yandexId: ${yandexId}`)

    const user = await this.userService.findOrCreateOAuthUser('YANDEX', {
      email,
      displayName,
      picture,
      provider: 'yandex',
      providerId: yandexId
    })

    if (!user) {
      const message = `Yandex login. User not found. yandexId: ${yandexId}`
      this.logger.warn(message)
      throw new NotFoundException(message)
    }

    return this.login(user.id)
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
    this.logger.log(`Refresh for token: ${sliceToken(oldRefreshToken)}`)

    const hashed = this.hashCrypto(oldRefreshToken)
    const tokenRecord = await this.prisma.refreshToken.findUnique({
      where: { token: hashed }
    })

    if (!tokenRecord || tokenRecord.expiresAt < new Date()) {
      const message = `Invalid or expired refresh token: ${sliceToken(oldRefreshToken)}`
      this.logger.warn(message)
      throw new UnauthorizedException(message)
    }

    const user = await this.userService.findById(tokenRecord.userId)

    if (!user) {
      const message = 'The user was not found when updating the token.'
      this.logger.warn(message)
      throw new NotFoundException(message)
    }

    await this.prisma.refreshToken.delete({
      where: { token: hashed }
    })

    return this.login(user.id)
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

  private generateTokenWithHash(): {
    token: string
    tokenHash: string
  } {
    const token = randomBytes(64).toString('base64url')
    const tokenHash = this.hashCrypto(token)

    return {
      token,
      tokenHash
    }
  }
}
