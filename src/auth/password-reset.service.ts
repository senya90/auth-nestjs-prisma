import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException
} from '@nestjs/common'
import { ConfigService } from '@nestjs/config'

import { sliceToken } from '../common/utils/token-slicer.util.js'
import { MailService } from '../mail/mail.service.js'
import { PrismaService } from '../prisma/prisma.service.js'
import { UserService } from '../user/user.service.js'
import { ForgotPasswordDTO } from './dto/forgot-password.dto.js'
import { ResetPasswordDTO } from './dto/reset-password.dto.js'
import { HashGeneratorService } from './hash-generator.service.js'

@Injectable()
export class PasswordResetService {
  private readonly logger = new Logger(PasswordResetService.name)
  private readonly TTL_MS = 60 * 60 * 1000 // 1 час
  private readonly frontendUrl: string

  constructor(
    private readonly userService: UserService,
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
    private readonly hashGeneratorService: HashGeneratorService,
    private readonly mailService: MailService
  ) {
    this.frontendUrl = this.configService.getOrThrow<string>('FRONTEND_URL')
  }

  async forgotPassword(dto: ForgotPasswordDTO) {
    const { email } = dto
    this.logger.log(`Password reset requested for email: ${email}`)

    const user = await this.userService.findByEmail(email)

    if (!user) {
      this.logger.warn(
        `Password reset requested for non-existent email: ${email}`
      )
      return
    }

    if (user.method !== 'CREDENTIALS') {
      this.logger.warn(`Password reset requested for OAuth user emal: ${email}`)
      return
    }

    await this.prisma.passwordResetToken.deleteMany({
      where: { userId: user.id }
    })

    const { token, tokenHash } =
      this.hashGeneratorService.generateTokenWithHash()

    await this.prisma.passwordResetToken.create({
      data: {
        userId: user.id,
        tokenHash,
        expiresAt: new Date(Date.now() + this.TTL_MS)
      }
    })

    const resetUrl = `Confirm reset password by following the link ${this.frontendUrl}/auth/reset-password?token=${token}`
    this.logger.debug(
      `Password reset token: ${token} ${sliceToken(token)}, hash: ${sliceToken(tokenHash)}`
    )
    this.logger.verbose(`resetUrl: ${resetUrl}`)

    await this.mailService.sendEmail({
      to: user.email,
      message: resetUrl,
      subject: 'Reset password'
    })

    this.logger.log(`Password reset email sent to: ${user.email}`)
  }

  async resetPassword(dto: ResetPasswordDTO) {
    const { token, newPassword } = dto

    const tokenHash = this.hashGeneratorService.hashCrypto(token)

    const tokenRecord = await this.prisma.passwordResetToken.findUnique({
      where: { tokenHash }
    })

    if (!tokenRecord) {
      const message = `Invalid reset token ${sliceToken(token)} (hash: ${sliceToken(tokenHash)})`
      this.logger.warn(message)
      throw new BadRequestException(message)
    }

    if (tokenRecord.expiresAt < new Date()) {
      await this.prisma.passwordResetToken.delete({
        where: { tokenHash }
      })

      const message = `Reset token has expired. token: ${sliceToken(token)} (hash: ${sliceToken(tokenHash)})`
      this.logger.warn(message)
      throw new BadRequestException(message)
    }

    const user = await this.userService.findById(tokenRecord.userId)
    if (!user) {
      const message = `User not found ${tokenRecord.userId}`
      this.logger.warn(message)
      throw new NotFoundException(message)
    }

    const passwordHash = newPassword
      ? await this.hashGeneratorService.hashByRounds(newPassword)
      : ''

    await this.prisma.$transaction([
      this.prisma.password.upsert({
        where: { userId: user.id },
        update: { passwordHash },
        create: { userId: user.displayName, passwordHash }
      }),
      this.prisma.refreshToken.deleteMany({
        where: { userId: user.id }
      }),
      this.prisma.passwordResetToken.delete({
        where: { tokenHash }
      }),
      this.prisma.verificationToken.deleteMany({
        where: { userId: user.id }
      })
    ])

    this.logger.log(`Password reset successfully for user ${user.id}`)
  }
}
