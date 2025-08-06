export function isErrorArray(value: unknown): boolean {
    return Array.isArray(value) && value.every(item => item instanceof Error)
}

export function isStringOrNumberArray(value: unknown): boolean {
    return Array.isArray(value) && value.every(item => typeof(item)  === 'string' || typeof(item) === 'number')
}

export function isError(obj: unknown): obj is Error {
  if (obj instanceof Error) return true;

  // Check for error-like objects (might happen with serialization)
  return typeof obj === 'object' && obj !== null &&
         'message' in obj && typeof obj.message === 'string' &&
         ('stack' in obj || 'name' in obj);
}
