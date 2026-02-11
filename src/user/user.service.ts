import { Injectable } from '@nestjs/common'
import { hash } from 'argon2'

import { User } from '../__generated__/client.js'
import { AuthMethod } from '../__generated__/enums.js'
import { PrismaService } from '../prisma/prisma.service.js'

@Injectable()
export class UserService {
  constructor(private readonly prismaService: PrismaService) {}

  async findById(id: string): Promise<User | null> {
    return this.prismaService.user.findUnique({
      where: {
        id
      },
      include: {
        accounts: true
      }
    })
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.prismaService.user.findUnique({
      where: {
        email
      },
      include: {
        accounts: true
      }
    })
  }

  async create(params: {
    email: string
    password: string
    displayName: string
    picture: string
    method: AuthMethod
    isVerified: boolean
  }) {
    const { email, password, displayName, isVerified, method, picture } = params
    return await this.prismaService.user.create({
      data: {
        email,
        displayName,
        picture,
        method,
        isVerified,
        password: password ? await hash(password) : ''
      },
      include: {
        accounts: true
      }
    })
  }
}
