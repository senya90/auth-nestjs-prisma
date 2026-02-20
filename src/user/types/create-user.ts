import { AuthMethod } from '../../__generated__/enums.js'

export interface CreateUser {
  email: string
  method: AuthMethod
  passwordHash?: string
  displayName?: string
  picture?: string
  isVerified?: boolean
}
