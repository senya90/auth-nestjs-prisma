import { ConflictException, Injectable, Logger } from '@nestjs/common'
import { hash } from 'argon2'

import { User } from '../__generated__/client.js'
import { UserService } from '../user/user.service.js'
import { RegisterDTO } from './dto/register.dto.js'

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name)

  constructor(private readonly userService: UserService) {}

  async register(dto: RegisterDTO): Promise<User> {
    const user = await this.userService.findByEmail(dto.email)

    if (user) {
      throw new ConflictException('A user with this email already exists.')
    }

    const { email, name, password } = dto
    const newUser = await this.userService.create({
      email,
      displayName: name,
      password: password ? await hash(password) : '',
      isVerified: false,
      method: 'CREDENTIALS',
      picture: ''
    })

    this.saveSession(newUser)

    return newUser
  }

  saveSession(user: User) {
    this.logger.log(`Session saved. User: ${user.id}, ${user.email}`)
  }
}
