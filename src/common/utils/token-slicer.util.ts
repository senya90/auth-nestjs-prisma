interface SliceTokenOptions {
  first?: number
  last?: number
  placeholder?: string
}

export function sliceToken(
  token: string | null | undefined,
  options: SliceTokenOptions = {}
): string {
  if (!token) return ''

  const { first = 5, last = 3, placeholder = '...' } = options

  if (token.length <= first + last) return token

  return token.slice(0, first) + placeholder + token.slice(-last)
}
