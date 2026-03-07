import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import bcrypt from 'bcrypt'
import { createHash, randomBytes } from 'crypto'

@Injectable()
export class HashGeneratorService {
  private readonly algorithm: string
  private readonly saltRounds: number

  constructor(private readonly configService: ConfigService) {
    this.algorithm =
      this.configService.getOrThrow<string>('CRYPTO_ALGORITHM') ?? 'sha256'

    this.saltRounds = Number(
      this.configService.getOrThrow<number>('SALT_ROUNDS')
    )
  }

  generateTokenWithHash(): {
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

  hashCrypto(value: string): string {
    return createHash(this.algorithm).update(value).digest('hex')
  }

  hashByRounds(value: string): Promise<string> {
    return bcrypt.hash(value, this.saltRounds)
  }

  async validateRoundedHash(
    value: string,
    hash: string | undefined | null
  ): Promise<boolean> {
    if (!hash) return false

    return bcrypt.compare(value, hash)
  }
}
