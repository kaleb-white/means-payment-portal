import { DateInYearQuarter } from "./lib/services/database/schemas"

/**
 * Converts floating point numbers to financial with two digits of precision using regex.
 * @param number - A number in the format, for example, 1234.00.
 * @returns - A number in the format, for example, $1,234.00.
*/
export function numberToFinancial(num: string): string {
    // Convert to two digits of precision
    num = String(Number(num).toFixed(2))

    // Reverse the string, necessary because regex needs to parse starting from the back of the num
    num = num.split("").reverse().join("")

    // Globally match 3 numbers in a row, replace them with a period after each number
    num = num.replace(/[0-9]{3}/g, (m) => m.concat(','))

    // Remove final comma if exists, append $
    num = num.replace(/,$/, "")
    num = num.concat("$")

    // Reverse again
    num = num.split("").reverse().join("")

    return num
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
 * Given a DateInYearQuarter object, converst it into a TS Date object.
 * Uses the YYYY-MM overload on the Date constructor: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date#date_time_string_format
 * @param quarter
 * @returns a new Date
 */
export function dateInYearQuarterToDate(quarter: DateInYearQuarter): Date {
    const month = Number(quarter.quarter) * 3
    return new Date(`${quarter.year}-${month < 10 ? `0${month}` : `${month}`}`)
}

/**
 * Given a string in the format yyyyQn, ie 2025Q1, converst it into a DateInYearQuarter object.
 * For example, 2025Q1 becomes {year: "2025", quarter:"1"}
 * @param quarter
 * @returns a new DateInYearQuarter
 */
export function quarterToDateInYearQuarter(quarter: string): DateInYearQuarter {
    return {year: quarter.slice(0,4), quarter: quarter.slice(-1)}
}

/**
 * Converts a number of quarters and a start year and quarter to the object used by the analytics service.
 * @param quarters Number of quarters previous to get reports for.
 * @param year Default is the current year.
 * @param quarter Default is the current quarter. A number between 1 and 4.
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
