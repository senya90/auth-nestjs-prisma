import { BadRequestException, Injectable, Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'

import { sliceToken } from '../common/utils/token-slicer.util.js'
import { MailService } from '../mail/mail.service.js'
import { PrismaService } from '../prisma/prisma.service.js'
import { HashGeneratorService } from './hash-generator.service.js'

@Injectable()
export class VerificationService {
  private readonly logger = new Logger(VerificationService.name)
  private readonly TTL_MS = 24 * 60 * 60 * 1000 // 24 часа
  private readonly frontendUrl: string

  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
    private readonly hashGeneratorService: HashGeneratorService,
    private readonly mailService: MailService
  ) {
    this.frontendUrl = this.configService.getOrThrow<string>('FRONTEND_URL')
  }

  async sendVerificationEmail(userId: string, mailToAddress: string) {
    const { token, tokenHash } =
      this.hashGeneratorService.generateTokenWithHash()

    // todo: сделать задачу, которая должна будет очищать устаревшие, неактуальные токены
    await this.prisma.verificationToken.create({
      data: {
        userId,
        tokenHash,
        expiresAt: new Date(Date.now() + this.TTL_MS)
      }
    })

    const textMessage = `Confirm by following the link
    ${this.frontendUrl}/api/auth/verify-email?token=${token}`

    this.logger.debug(
      `Attempt to send an email. To ${mailToAddress}, token: ${sliceToken(token)}`
    )
    await this.mailService.sendEmail({
      to: mailToAddress,
      message: textMessage
    })
    this.logger.log(
      `Verification email sent to ${mailToAddress}, token: ${sliceToken(token)}`
    )
  }

  async verifyEmail(token: string): Promise<boolean> {
    const tokenHash = this.hashGeneratorService.hashCrypto(token)

    const tokenRecord = await this.prisma.verificationToken.findUnique({
      where: { tokenHash }
    })

    if (!tokenRecord) {
      const message = `Invalid verification token ${sliceToken(token)} (hash ${sliceToken(tokenHash)})`
      this.logger.warn(message)
      throw new BadRequestException(message)
    }

    // todo: сделать задачу, которая должна будет очищать устаревшие, неактуальные токены
    if (tokenRecord.revoked) {
      await this.prisma.verificationToken.delete({
        where: { tokenHash }
      })

      const message = `The token has already been revoked ${sliceToken(token)} (hash ${sliceToken(tokenHash)})`
      this.logger.warn(message)
      throw new BadRequestException(message)
    }

    if (tokenRecord.expiresAt < new Date()) {
      await this.prisma.verificationToken.delete({
        where: { tokenHash }
      })

      const message = `Verification token has expired ${sliceToken(token)} (hash ${sliceToken(tokenHash)})`
      this.logger.warn(message)
      throw new BadRequestException(message)
    }

    await this.prisma.$transaction(async (tx) => {
      await tx.user.update({
        where: { id: tokenRecord.userId },
        data: { isVerified: true }
      })

      await tx.verificationToken.delete({
        where: { tokenHash }
      })

      this.logger.log(`User ${tokenRecord.userId} verified email`)
    })

    return true
  }
}
