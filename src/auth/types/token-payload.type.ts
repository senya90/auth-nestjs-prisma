import { PermissionName, RoleName } from '../../__generated__/enums.js'

export interface TokenPayload {
  sub: string
  roles: {
    id: string
    name: RoleName
    permissions: {
      id: string
      name: PermissionName
    }[]
  }[]
}

export interface TokenPayloadFull extends TokenPayload {
  iat: number
  exp: number
}
