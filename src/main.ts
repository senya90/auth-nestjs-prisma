import { ValidationPipe } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { NestFactory } from '@nestjs/core'
import cookieParser from 'cookie-parser'

import { AppModule } from './app.module'

async function bootstrap() {
  const app = await NestFactory.create(AppModule)
  const config = app.get(ConfigService)

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

  await app.listen(config.getOrThrow<number>('AUTH_SERVICE_PORT'))
}

bootstrap()
  .then(() => {})
  .catch(() => {})
