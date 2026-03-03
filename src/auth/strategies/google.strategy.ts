import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { PassportStrategy } from '@nestjs/passport'
import { Profile, Strategy, VerifyCallback } from 'passport-google-oauth20'

import { GoogleProfile } from '../types/google-profile.type.js'

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(private readonly configService: ConfigService) {
    super({
      clientID: configService.getOrThrow<string>('GOOGLE_CLIENT_ID'),
      clientSecret: configService.getOrThrow<string>('GOOGLE_CLIENT_SECRET'),
      callbackURL: configService.getOrThrow<string>('GOOGLE_CALLBACK_URL'),
      scope: ['email', 'profile']
    })
  }

  validate(
    accessToken: string,
    refreshToken: string | null,
    profile: Profile,
    done: VerifyCallback
  ) {
    const { id, displayName, emails, photos } = profile

    const googleProfile: GoogleProfile = {
      accessToken,
      displayName,
      email: emails?.[0]?.value ?? '',
      picture: photos?.[0]?.value ?? '',
      refreshToken: refreshToken ?? null,
      googleId: id
    }

    done(null, googleProfile)
  }
}
