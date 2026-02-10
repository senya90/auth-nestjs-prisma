import { PrismaPg } from '@prisma/adapter-pg'
import 'dotenv/config'

import { PrismaClient } from '../__generated__/client.js'

const connectionString = `${process.env.POSTGRES_URI}`

const adapter = new PrismaPg({ connectionString })
const prisma = new PrismaClient({ adapter })

export { prisma }
