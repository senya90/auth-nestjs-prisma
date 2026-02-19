import { ValidationPipe } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { NestFactory } from '@nestjs/core'
// import { RedisStore } from 'connect-redis'
import cookieParser from 'cookie-parser'
import session from 'express-session'
// import { Redis as IORedis } from 'ioredis'
import ms, { StringValue } from 'ms'
import { WinstonModule } from 'nest-winston'

import { AppModule } from './app.module.js'
import { parseBoolean } from './common/utils/boolean/boolean.util.js'
import { winstonConfig } from './logger/logger.config.js'

async function bootstrap() {
  const app = await NestFactory.create(AppModule)
  const config = app.get(ConfigService)
  const logger = WinstonModule.createLogger(winstonConfig(config))
  app.useLogger(logger)

  // const redis = new IORedis(config.getOrThrow('REDIS_URI'))

  app.use(cookieParser(config.getOrThrow<string>('COOKIE_SECRET')))
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true
    })
  )
  app.enableCors({
    origin: config.getOrThrow<string>('CORS_ALLOWED_ORIGIN'),
    credentials: true,
    exposedHeaders: ['set-cookie']
  })

  app.use(
    session({
      secret: config.getOrThrow<string>('SESSION_SECRET'),
      name: config.getOrThrow<string>('SESSION_NAME'),
      resave: true,
      saveUninitialized: false,
      cookie: {
        domain: config.getOrThrow<string>('SESSION_DOMAIN'),
        maxAge: ms(config.getOrThrow<string>('SESSION_MAX_AGE') as StringValue),
        httpOnly: parseBoolean(config.getOrThrow<string>('SESSION_HTTP_ONLY')),
        secure: parseBoolean(config.getOrThrow<string>('SESSION_SECURE')),
        sameSite: 'lax'
      }
      // store: new RedisStore({
      //   client: redis,
      //   prefix: config.getOrThrow<string>('SESSION_FOLDER')
      // })
    })
  )

  const port = config.getOrThrow<number>('AUTH_SERVICE_PORT')
  await app.listen(port)
  logger.log(`Server started on :${port}`)
}

bootstrap()
  .then(() => {})
  .catch(() => {})
