import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { PassportStrategy } from '@nestjs/passport'
import { Profile, Strategy } from 'passport-github2'

import { GithubProfile } from '../types/github-profile.type.js'

@Injectable()
export class GithubStrategy extends PassportStrategy(Strategy, 'github') {
  constructor(private readonly configService: ConfigService) {
    super({
      clientID: configService.getOrThrow<string>('GITHUB_CLIENT_ID'),
      clientSecret: configService.getOrThrow<string>('GITHUB_CLIENT_SECRET'),
      callbackURL: configService.getOrThrow<string>('GITHUB_CALLBACK_URL'),
      scope: ['user:email']
    })
  }

  validate(
    _accessToken: string,
    _refreshToken: string | null,
    profile: Profile,
    done: (error: unknown, user?: GithubProfile) => void
  ) {
    const { id, emails, displayName, photos } = profile

    const email = emails?.[0]?.value ?? ''

    const githubProfile: GithubProfile = {
      githubId: id,
      email,
      picture: photos?.[0]?.value ?? '',
      displayName: displayName ?? profile.username ?? ''
    }

    done(null, githubProfile)
  }
}
