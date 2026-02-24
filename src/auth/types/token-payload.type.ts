import { PERMISSION } from '../roles/constants/permissions.constants.js'
import { ROLE } from '../roles/constants/roles.constants.js'

export interface TokenPayload {
  sub: string
  roles: {
    id: string
    name: ROLE
    permissions: {
      id: string
      name: PERMISSION
    }[]
  }[]
}

export interface TokenPayloadFull extends TokenPayload {
  iat: number
  exp: number
}
