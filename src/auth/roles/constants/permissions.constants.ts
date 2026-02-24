import { PermissionName } from '../../../__generated__/enums.js'

const PERMISSIONS_IDS: Record<keyof typeof PermissionName, string> = {
  USER__READ: 'f280bb72-6fe6-45b2-aa6f-481cca79f942',
  USER__EDIT: 'f5f835d0-41c3-42f3-8541-d57818c7992d',
  PERMISSION__ADD: 'f422efaa-6658-4160-b971-65c25c77073a',
  PERMISSION__ASSIGN: '8a7e0c8c-99c0-44ba-ad86-ac0cee5f536d',
  ROLE__ASSIGN: '1e8b1199-d0cd-409a-8d49-3a2d64bda0ee',
  TEST__MUTATION: 'abe5d13e-b6d7-4776-b984-86176ef2a8aa',
  TEST__READ: 'c7bf6f3f-714e-435b-9c76-62b1fbedce4f'
}

export const PERMISSIONS = {
  IDS: PERMISSIONS_IDS,
  DECORATOR_KEY: 'permissions'
}
