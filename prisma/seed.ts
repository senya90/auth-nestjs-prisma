import { PrismaPg } from '@prisma/adapter-pg'
import bcrypt from 'bcrypt'

import { Permission, PrismaClient } from '../src/__generated__/client.js'
import { PERMISSION, PERMISSIONS } from '../src/auth/roles/constants/permissions.constants.js'
import { ROLE, ROLES } from '../src/auth/roles/constants/roles.constants.js'

const adapter = new PrismaPg({
  connectionString: `postgresql://${process.env.POSTGRES_USER}:${process.env.POSTGRES_PASSWORD}@${process.env.POSTGRES_HOST}:${process.env.POSTGRES_PORT}/${process.env.POSTGRES_DB}`
})

const prisma = new PrismaClient({ adapter })

async function main() {
  const permissions = await Promise.all([
    prisma.permission.upsert({
      where: { id: PERMISSIONS.IDS.USER__READ },
      update: {},
      create: {
        id: PERMISSIONS.IDS.USER__READ,
        name: PERMISSION.USER__READ,
        description: 'Read user data'
      }
    }),
    prisma.permission.upsert({
      where: { id: PERMISSIONS.IDS.USER__EDIT },
      update: {},
      create: {
        id: PERMISSIONS.IDS.USER__EDIT,
        name: PERMISSION.USER__EDIT,
        description: 'Edit user data'
      }
    }),
    prisma.permission.upsert({
      where: { id: PERMISSIONS.IDS.PERMISSION__ADD },
      update: {},
      create: {
        id: PERMISSIONS.IDS.PERMISSION__ADD,
        name: PERMISSION.PERMISSION__ADD,
        description: 'Add new permission'
      }
    }),
    prisma.permission.upsert({
      where: { id: PERMISSIONS.IDS.PERMISSION__ASSIGN },
      update: {},
      create: {
        id: PERMISSIONS.IDS.PERMISSION__ASSIGN,
        name: PERMISSION.PERMISSION__ASSIGN,
        description: 'Assign permission to a role'
      }
    }),
    prisma.permission.upsert({
      where: { id: PERMISSIONS.IDS.ROLE__ASSIGN },
      update: {},
      create: {
        id: PERMISSIONS.IDS.ROLE__ASSIGN,
        name: PERMISSION.ROLE__ASSIGN,
        description: 'Assign a role to a user'
      }
    })
  ])

  const admin = await prisma.role.upsert({
    where: { id: ROLES.IDS.ADMIN },
    update: {},
    create: {
      id: ROLES.IDS.ADMIN,
      name: ROLE.ADMIN,
      description: 'Administrator'
    }
  })

  const support = await prisma.role.upsert({
    where: { id: ROLES.IDS.SUPPORT },
    update: {},
    create: {
      id: ROLES.IDS.SUPPORT,
      name: ROLE.SUPPORT,
      description: 'Can read some restricted information to investigate issues'
    }
  })

  const guest = await prisma.role.upsert({
    where: { id: ROLES.IDS.GUEST },
    update: {},
    create: {
      id: ROLES.IDS.GUEST,
      name: ROLE.GUEST,
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
