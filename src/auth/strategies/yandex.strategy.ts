import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { PassportStrategy } from '@nestjs/passport'
import { Profile } from 'passport'
import { Strategy } from 'passport-yandex'

import { YandexProfile } from '../types/yandex-profile.type.js'

@Injectable()
export class YandexStrategy extends PassportStrategy(Strategy, 'yandex') {
  constructor(private readonly configService: ConfigService) {
    super({
      clientID: configService.getOrThrow<string>('YANDEX_CLIENT_ID'),
      clientSecret: configService.getOrThrow<string>('YANDEX_CLIENT_SECRET'),
      callbackURL: configService.getOrThrow<string>('YANDEX_CALLBACK_URL')
    })
  }

  validate(
    _accessToken: string,
    _refreshToken: string | null,
    profile: Profile,
    done: (error: unknown, user?: YandexProfile) => void
  ) {
    const { id, emails, displayName, photos } = profile

    const email = emails?.[0]?.value ?? ''

    const yandexProfile: YandexProfile = {
      yandexId: id,
      email,
      picture: photos?.[0]?.value ?? '',
      displayName: displayName ?? profile.username ?? ''
    }

    done(null, yandexProfile)
  }
}
