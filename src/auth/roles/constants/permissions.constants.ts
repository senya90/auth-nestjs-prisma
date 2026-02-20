const PERMISSIONS_IDS: Record<keyof typeof PERMISSION, string> = {
  USER__READ: 'f280bb72-6fe6-45b2-aa6f-481cca79f942',
  USER__EDIT: 'f5f835d0-41c3-42f3-8541-d57818c7992d',
  PERMISSION__ADD: 'f422efaa-6658-4160-b971-65c25c77073a',
  PERMISSION__ASSIGN: '8a7e0c8c-99c0-44ba-ad86-ac0cee5f536d',
  ROLE__ASSIGN: '1e8b1199-d0cd-409a-8d49-3a2d64bda0ee'
}

export const PERMISSIONS = {
  IDS: PERMISSIONS_IDS,
  DECORATOR_KEY: 'permissions'
}

export enum PERMISSION {
  USER__READ = 'user:read',
  USER__EDIT = 'user:edit',
  PERMISSION__ADD = 'permission:add',
  PERMISSION__ASSIGN = 'permission:assign',
  ROLE__ASSIGN = 'role:assign'
}
