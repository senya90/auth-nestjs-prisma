import 'express-session'

declare module 'express-session' {
  interface SessionDate {
    userId?: string
  }
}
