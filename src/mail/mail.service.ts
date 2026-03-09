import {
  Injectable,
  InternalServerErrorException,
  Logger
} from '@nestjs/common'
import { ConfigService } from '@nestjs/config'

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name)
  private readonly mailServiceUrl: string

  constructor(private readonly configService: ConfigService) {
    this.mailServiceUrl =
      this.configService.getOrThrow<string>('MAIL_SERVICE_URL')
  }

  async sendEmail(params: { to: string; message: string; subject?: string }) {
    const { to, message, subject = 'Email verification' } = params
    this.logger.log(`Sending email to ${to}`)

    const response = await fetch(`${this.mailServiceUrl}/send`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ to, message, subject })
    })

    if (!response.ok) {
      const error = await response.text()
      this.logger.error(`Mail service error: ${error}`)
      throw new InternalServerErrorException(
        'Failed to send verification email'
      )
    }
  }
}
