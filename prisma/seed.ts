import { PrismaPg } from '@prisma/adapter-pg'

import { PrismaClient } from '../src/__generated__/client.js'

const adapter = new PrismaPg({
  connectionString: `postgresql://${process.env.POSTGRES_USER}:${process.env.POSTGRES_PASSWORD}@${process.env.POSTGRES_HOST}:${process.env.POSTGRES_PORT}/${process.env.POSTGRES_DB}`
})
const prisma = new PrismaClient({ adapter })

async function main() {
  const permissions = await Promise.all([
    prisma.permission.upsert({
      where: { name: 'user:read' },
      update: {},
      create: { name: 'user:read', description: 'Read user data' }
    }),
    prisma.permission.upsert({
      where: { name: 'user:edit' },
      update: {},
      create: { name: 'user:edit', description: 'Edit user data' }
    }),
    prisma.permission.upsert({
      where: { name: 'permission:add' },
      update: {},
      create: { name: 'permission:add', description: 'Add new permission' }
    }),
    prisma.permission.upsert({
      where: { name: 'permission:assign' },
      update: {},
      create: { name: 'permission:assign', description: 'Assign permission to a role' }
    }),
    prisma.permission.upsert({
      where: { name: 'role:assign' },
      update: {},
      create: { name: 'role:assign', description: 'Assign a role to a user' }
    })
  ])

  const admin = await prisma.role.upsert({
    where: { name: 'Admin' },
    update: {},
    create: { name: 'Admin', description: 'Administrator' }
  })

  const support = await prisma.role.upsert({
    where: { name: 'Support' },
    update: {},
    create: {
      name: 'Support',
      description: 'Can read some restricted information to investigate issues'
    }
  })

  const guest = await prisma.role.upsert({
    where: { name: 'Guest' },
    update: {},
    create: { name: 'Guest', description: 'Read open data' }
  })

  const rolePermissions: Record<string, string[]> = {
    [admin.name]: ['user:read', 'user:edit', 'permission:add', 'permission:assign', 'role:assign'],
    [support.name]: ['user:read', 'user:edit'],
    [guest.name]: []
  }

  for (const [roleName, permissionNames] of Object.entries(rolePermissions)) {
    const role = await prisma.role.findUnique({ where: { name: roleName } })
    if (!role) throw new Error(`Role ${roleName} not found`)

    await prisma.rolePermission.createMany({
      data: permissionNames.map((name) => {
        const permission = permissions.find((p) => p.name === name)
        if (!permission) throw new Error(`Permission ${name} not found`)
        return { roleId: role.id, permissionId: permission.id }
      }),
      skipDuplicates: true
    })
  }

  console.log('--- Seed completed ---')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
