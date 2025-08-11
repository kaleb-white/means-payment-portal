/**
 * Generously parses any sort of table headers, where user input headers may not exactly match required headers.
 * For example, the header Coupon Code would be matched to [Coupon Code, coupon code, CouponCode, couponcode, and couponCode].
 * @param headersExpected The headers that are supposed to exist, ie ['Email', 'Code']
 * @param headersParsed The headers that were found.
 * @returns missingHeaders: a list of the names of headers, taken from headersExpected, that were not found in headersParsed, and mappedHeaders: a object containing the expected headers as keys and what they were found as for values.
 *
 */
export function checkHeaders(headersExpected: Array<string>, headersParsed: Array<string>): {'missingHeaders': string[], 'mappedHeaders': {[key: string]: string}} {
    // For example, Coupon Code becomes [Coupon Code, coupon code, CouponCode, couponcode, and couponCode]
    const possibleHeaders = headersExpected.map(h => [h, h.toLowerCase(), h.replace(' ', ''), h.replace(' ', '').toLowerCase(), h.replace(' ', '').replace(/^.{1}/, h[0].toLowerCase())])

    // Want it to match at least one of the possible headers
    const actualHeaders: {[key:string]: string} = {}
    const missingHeaders = possibleHeaders.map(arr =>
        !arr.map(poss => {
            if (headersParsed.includes(poss)) {
                actualHeaders[arr[0]] = poss
                return true
            }
            return false
        }).includes(true)? arr[0] : null
    ).filter(e => e) as string[]

    return {'missingHeaders': missingHeaders, 'mappedHeaders': actualHeaders}
}
