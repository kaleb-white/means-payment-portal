export function isErrorArray(value: unknown): boolean {
    return Array.isArray(value) && value.every(item => item instanceof Error)
}

export function isStringOrNumberArray(value: unknown): boolean {
    return Array.isArray(value) && value.every(item => typeof(item)  === 'string' || typeof(item) === 'number')
}

export function isStringArray(value: unknown): boolean {
    return Array.isArray(value) && value.every(item => typeof(item)  === 'string')
}

export function isNumberArray(value: unknown): boolean {
    return Array.isArray(value) && value.every(item => typeof(item) === 'number')
}

export function isError(obj: unknown): obj is Error {
  if (obj instanceof Error) return true;

  // Check for error-like objects (might happen with serialization)
  return typeof obj === 'object' && obj !== null &&
         'message' in obj && typeof obj.message === 'string' &&
         ('stack' in obj || 'name' in obj);
}

export function isQuarterlyReport(obj: unknown): boolean {
    return typeof obj === 'object' && obj !== null &&
        'year' in obj && typeof obj.year === 'number' &&
        'quarter' in obj && typeof obj.quarter === 'number' &&
        'report_data' in obj && typeof obj.report_data === 'object'

}

export function isCouponCode(obj: unknown): boolean {
    return typeof obj === 'object' && obj !== null &&
        'email' in obj && typeof obj.email === 'string' &&
        'couponCode' in obj && typeof obj.couponCode === 'string'
}
