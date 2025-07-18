import { DateInYearQuarter } from "./lib/services/database/interfaces"

/**
 * Converts a number in the format [0-9]*.[0-9]{2} to $([0-9]{3},)*.[0-9]{2}. (Regex not exact).
 * If the number doesn't contain '.' in the last 3 positions, returns the string it was called with.
 * Fault tolerant of numbers ending in .[0-9] or '.'.
 * @param number - A number in the format, for example, 1234.00.
 * @returns - A number in the format, for example, $1,234.00.
*/
export function numberToFinancial(number: string): string {
    const last3 = number.slice(number.length - 3)

    if (!last3.includes('.')) {
        return number
    }

    if (last3[1] === '.') {
        number = number.replace(/$/, '0')
    } else if (last3[2] === '.') {
        number = number.replace(/$/, '00')
    }

    let o = ""
    for (let i = number.length - 4; i >= 0; i -= 3) {
        if (i === number.length - 4) {
            const comma = i - 3 < 0 ? "" : ","
            o = o.replace(/^/, `${comma}${number.slice(i - 2, i + 1)}.${number.slice(number.length - 2, number.length)}`)
        } else if (i - 3 < 0) {
            o = o.replace(/^/, number.slice(0, i + 1))
        } else {
            o = o.replace(/^/, `,${number.slice(i-2, i + 1)}`)
        }
    }
    o = o.replace(/^/, "$")
    return o
}

/**
 * Given a string in the format yyyyQn, ie 2025Q1, converts it into a TS Date object.
 * Uses the YYYY-MM overload on the Date constructor: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date#date_time_string_format
 * @param quarter
 * @returns a new Date
 */
export function quarterToDate(quarter: string): Date {
    const month = Number(quarter.slice(-1)) * 3
    return new Date(`${quarter.slice(0, 4)}-${month < 10 ? `0${month}` : `${month}`}`)
}

/**
 * Converts a number of quarters and a start year and quarter to the object used by the analytics service.
 * @param quarters - Number of quarters previous to get reports for.
 * @param year - Default is the current year.
 * @param quarter - Default is the current quarter. A number between 1 and 4.
 * @returns An array of type DateInYearQuarter[].
 */
export function quartersToYearsAndQuarters(
    quarters: number,
    year: number = new Date().getFullYear(),
    quarter: number = Math.floor((new Date().getMonth() + 3) / 3) - 1 // Subtract 1 because current still in progress
): DateInYearQuarter[] {
    const returnArray = []
    for (let _ = quarters; _ >= 1 ; _--) {
        returnArray.push({year: String(year), quarter: String(quarter)})
        quarter--
        if (quarter === 0) {
            year--
            quarter = 4
        }
    }
    return returnArray
}
