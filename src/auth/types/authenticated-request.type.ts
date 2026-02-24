import { TokenPayload } from './token-payload.type.js'

interface AuthCookies {
  access_token?: string
  refresh_token?: string
}

export interface AuthenticatedRequest extends Request {
  cookies: AuthCookies
  user?: TokenPayload
}
