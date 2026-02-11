import { ConfigService } from '@nestjs/config'
import { utilities as nestWinstonModuleUtilities, WinstonModuleOptions } from 'nest-winston'
import * as winston from 'winston'
import 'winston-daily-rotate-file'

export const winstonConfig = (configService: ConfigService): WinstonModuleOptions => {
  const isProduction = configService.getOrThrow('NODE_ENV') === 'production'
  const level = configService.get<string>('LOG_LEVEL', 'info')

  const transports: winston.transport[] = [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.ms(),
        nestWinstonModuleUtilities.format.nestLike('auth_service', {
          colors: !isProduction,
          prettyPrint: true
        })
      )
    })
  ]

  // if (isProduction) {
  transports.push(
    new winston.transports.DailyRotateFile({
      filename: 'logs/auth-service-%DATE%.log',
      datePattern: 'DD-MM-YYYY',
      zippedArchive: true,
      maxSize: '20m',
      maxFiles: '14d',
      format: winston.format.combine(winston.format.timestamp(), winston.format.json())
    })
  )
  // }

  return {
    transports,
    level: level
  }
}
