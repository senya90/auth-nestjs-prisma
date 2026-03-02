export const TEXT = {
  VALIDATION: {
    BE: {
      STRING: 'Must be a string',
      ARRAY: 'Must be an array'
    },
    REQUIRED: 'Required field',
    EMAIL: {
      INVALID: 'Invalid email'
    },
    PASSWORD: {
      NOT_MATCH: 'Passwords do not match'
    },
    min: (count: number) => `Minimum character count: ${count}`,
    max: (count: number) => `Maximum character count: ${count}`
  }
}
