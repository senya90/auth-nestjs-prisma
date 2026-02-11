import { Module } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { WinstonModule } from 'nest-winston'

import { AuthModule } from './auth/auth.module.js'
import { winstonConfig } from './logger/logger.config.js'
import { PrismaModule } from './prisma/prisma.module.js'
import { UserModule } from './user/user.module.js'

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true
    }),
    WinstonModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => winstonConfig(configService)
    }),
    PrismaModule,
    AuthModule,
    UserModule
  ]
})
export class AppModule {}
