import { User } from '../../__generated__/client.js'
import { AuthCookies } from './auth-cookies.type.js'

export interface LoggedRequest extends Request {
  cookies: AuthCookies
  user?: User
}
