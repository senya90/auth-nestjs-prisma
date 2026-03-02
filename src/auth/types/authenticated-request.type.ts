import { AuthCookies } from './auth-cookies.type.js'
import { TokenPayload } from './token-payload.type.js'

export interface AuthenticatedRequest extends Request {
  cookies: AuthCookies
  user?: TokenPayload
}
