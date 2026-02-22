import { ROLE } from '../roles/constants/roles.constants.js'

export interface TokenPayload {
  sub: string
  roles: {
    id: string
    name: ROLE
  }[]
}

export interface TokenPayloadFull extends TokenPayload {
  iat: number
  exp: number
}
