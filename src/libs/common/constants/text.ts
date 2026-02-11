export const TEXT = {
  VALIDATION: {
    BE: {
      STRING: 'Must be a string'
    },
    REQUIRED: 'Required field',
    EMAIL: {
      INVALID: 'Invalid email'
    },
    PASSWORD: {
      NOT_MATCH: 'Passwords do not match'
    },
    min: (count: number) => `Minimum character count: ${count}`
  }
}
