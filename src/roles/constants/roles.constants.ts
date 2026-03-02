import { RoleName } from '../../__generated__/enums.js'

const ROLES_IDS: Record<keyof typeof RoleName, string> = {
  ADMIN: '14b1064c-d524-4b64-af54-578cf761ac3e',
  MODERATOR: 'aa47342f-d2d4-4056-8424-b71ebfe5da92',
  GUEST: 'b7faab28-5d8c-4526-9ec9-8d5a397ea34a',
  SUPPORT: 'a067cb7e-8b73-49cb-96de-196b2f301503'
}

export const ROLES = {
  VALIDATION: {
    PERMISSION: {
      NAME: {
        MIN_LENGTH: 3,
        MAX_LENGTH: 150
      },
      DESCRIPTION: {
        MIN_LENGTH: 3,
        MAX_LENGTH: 250
      }
    },
    ROLE: {
      NAME: {
        MIN_LENGTH: 3,
        MAX_LENGTH: 150
      },
      DESCRIPTION: {
        MIN_LENGTH: 3,
        MAX_LENGTH: 250
      }
    }
  },
  IDS: ROLES_IDS,
  DECORATOR_KEY: 'roles'
}
