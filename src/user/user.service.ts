import { Injectable, NotFoundException } from '@nestjs/common'
import { AuthMethod } from '@prisma/__generated__/enums'
import { hash } from 'argon2'

import { PrismaService } from '@/prisma/prisma.service'

@Injectable()
export class UserService {
  self = this
  constructor(private readonly prismaService: PrismaService) {}

  async findById(id: string) {
    const user = await this.prismaService.user.findUnique({
      where: {
        id
      },
      include: {
        accounts: true
      }
    })

    if (!user) throw new NotFoundException(`User not found, id: ${id}`)

    return user
  }

  async findByEmail(email: string) {
    const user = await this.prismaService.user.findUnique({
      where: {
        email
      },
      include: {
        accounts: true
      }
    })

    if (!user) throw new NotFoundException(`User not found, email: ${email}`)

    return user
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
