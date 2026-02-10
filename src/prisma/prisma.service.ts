import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { PrismaPg } from '@prisma/adapter-pg'

import { PrismaClient } from '../__generated__/client.js'

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  constructor(private config: ConfigService) {
    const adapter = new PrismaPg({
      connectionString: config.get<string>('POSTGRES_URI')!
    })

    super({ adapter })
  }

  async onModuleInit() {
    await this.$connect()
  }
  async onModuleDestroy() {
    await this.$disconnect()
  }
}
