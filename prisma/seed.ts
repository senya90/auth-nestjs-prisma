import { PrismaPg } from '@prisma/adapter-pg'
import bcrypt from 'bcrypt'

import { Permission, PrismaClient } from '../src/__generated__/client.js'

const adapter = new PrismaPg({
  connectionString: `postgresql://${process.env.POSTGRES_USER}:${process.env.POSTGRES_PASSWORD}@${process.env.POSTGRES_HOST}:${process.env.POSTGRES_PORT}/${process.env.POSTGRES_DB}`
})

const prisma = new PrismaClient({ adapter })

async function main() {
  const permissions = await Promise.all([
    prisma.permission.upsert({
      where: { id: 'f280bb72-6fe6-45b2-aa6f-481cca79f942' },
      update: {},
      create: {
        id: 'f280bb72-6fe6-45b2-aa6f-481cca79f942',
        name: 'user:read',
        description: 'Read user data'
      }
    }),
    prisma.permission.upsert({
      where: { id: 'f5f835d0-41c3-42f3-8541-d57818c7992d' },
      update: {},
      create: {
        id: 'f5f835d0-41c3-42f3-8541-d57818c7992d',
        name: 'user:edit',
        description: 'Edit user data'
      }
    }),
    prisma.permission.upsert({
      where: { id: 'f422efaa-6658-4160-b971-65c25c77073a' },
      update: {},
      create: {
        id: 'f422efaa-6658-4160-b971-65c25c77073a',
        name: 'permission:add',
        description: 'Add new permission'
      }
    }),
    prisma.permission.upsert({
      where: { id: '8a7e0c8c-99c0-44ba-ad86-ac0cee5f536d' },
      update: {},
      create: {
        id: '8a7e0c8c-99c0-44ba-ad86-ac0cee5f536d',
        name: 'permission:assign',
        description: 'Assign permission to a role'
      }
    }),
    prisma.permission.upsert({
      where: { id: '1e8b1199-d0cd-409a-8d49-3a2d64bda0ee' },
      update: {},
      create: {
        id: '1e8b1199-d0cd-409a-8d49-3a2d64bda0ee',
        name: 'role:assign',
        description: 'Assign a role to a user'
      }
    })
  ])

  const admin = await prisma.role.upsert({
    where: { id: '14b1064c-d524-4b64-af54-578cf761ac3e' },
    update: {},
    create: {
      id: '14b1064c-d524-4b64-af54-578cf761ac3e',
      name: 'Admin',
      description: 'Administrator'
    }
  })

  const support = await prisma.role.upsert({
    where: { id: 'a067cb7e-8b73-49cb-96de-196b2f301503' },
    update: {},
    create: {
      id: 'a067cb7e-8b73-49cb-96de-196b2f301503',
      name: 'Support',
      description: 'Can read some restricted information to investigate issues'
    }
  })

  const guest = await prisma.role.upsert({
    where: { id: 'b7faab28-5d8c-4526-9ec9-8d5a397ea34a' },
    update: {},
    create: {
      id: 'b7faab28-5d8c-4526-9ec9-8d5a397ea34a',
      name: 'Guest',
      description: 'Read open data'
    }
  })

  const [userRead, userEdit, permissionAdd, permissionAssign, roleAssign] = permissions

  const rolePermissions: Record<string, Permission[]> = {
    [admin.id]: [userRead, userEdit, permissionAdd, permissionAssign, roleAssign],
    [support.id]: [userRead, userEdit],
    [guest.id]: []
  }

  for (const [roleId, permission] of Object.entries(rolePermissions)) {
    const role = await prisma.role.findUnique({ where: { id: roleId } })
    if (!role) throw new Error(`Role id: ${roleId} not found`)

    await prisma.rolePermission.createMany({
      data: permission.map((permission) => {
        return { roleId: role.id, permissionId: permission.id }
      }),
      skipDuplicates: true
    })
  }

  const saltRounds = Number(process.env.SALT_ROUNDS) || 10
  const defaultAdminPassword = process.env.DEFAULT_ADMIN_PASSWORD || '00000000'
  const passwordHash = await bcrypt.hash(defaultAdminPassword, saltRounds)

  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@admin.com' },
    update: {},
    create: {
      email: 'admin@admin.com',
      displayName: 'User Admin',
      picture: '',
      method: 'CREDENTIALS',
      isVerified: true,
      password: {
        create: {
          passwordHash
        }
      }
    }
  })

  await prisma.userRole.upsert({
    where: {
      userId_roleId: {
        userId: adminUser.id,
        roleId: admin.id
      }
    },
    update: {},
    create: {
      userId: adminUser.id,
      roleId: admin.id
    }
  })

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
