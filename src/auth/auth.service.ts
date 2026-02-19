import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
  UnauthorizedException
} from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import bcrypt from 'bcrypt'
import type { Request, Response } from 'express'

import { User } from '../__generated__/client.js'
import { UserService } from '../user/user.service.js'
import { LoginDTO } from './dto/login.dto.js'
import { RegisterDTO } from './dto/register.dto.js'

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name)

  constructor(
    private readonly userService: UserService,
    private readonly configService: ConfigService
  ) {}

  async register(req: Request, dto: RegisterDTO): Promise<User> {
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

  async login(req: Request, dto: LoginDTO): Promise<User> {
    const user = await this.userService.findByEmail(dto.email)

    if (!user) {
      throw new NotFoundException('User not found')
    }

    const userPassword = await this.userService.findPasswordByUserId(user.id)

    const isValidPassword = await this.validatePassword(dto.password, userPassword?.passwordHash)

    if (!isValidPassword) {
      throw new UnauthorizedException('Incorrect login or password')
    }

    return user
  }

  async logout(req: Request, res: Response): Promise<void> {
    return new Promise((resolve, reject) => {
      req.session.destroy((err) => {
        if (err) {
          return reject(new InternalServerErrorException('Failed to terminate session when logout'))
        }

        res.clearCookie(this.configService.getOrThrow<string>('SESSION_NAME'))
        resolve()
      })
    })
  }

  private hashPassword(password: string): Promise<string> {
    const saltRounds = Number(this.configService.getOrThrow<number>('SALT_ROUNDS'))
    return bcrypt.hash(password, saltRounds)
  }

  private async validatePassword(
    password: string,
    hash: string | undefined | null
  ): Promise<boolean> {
    if (!hash) return false

    return bcrypt.compare(password, hash)
  }
}
