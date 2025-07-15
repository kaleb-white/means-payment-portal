export function numberToFinancial(number: string): string {
    let o = ""
    for (let i = number.length - 4; i >= 0; i -= 3) {
        if (i === number.length - 4) {
            o = o.replace(/^/, `,${number.slice(i - 2, i + 1)}.${number.slice(number.length - 2, number.length)}`)
        } else if (i - 3 < 0) {
            o = o.replace(/^/, number.slice(0, i + 1))
        } else {
            o = o.replace(/^/, `,${number.slice(i-2, i + 1)}`)
        }
    }
    o = o.replace(/^/, "$")
    return o
}

function quarterToDate(quarter: string): Date {
    // Period / quarter format: yyyyQn, ie 2025Q1
    // Date constructor accepts YYYY-MM as valid date: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date#date_time_string_format
    const month = Number(quarter.slice(-1)) * 3
    return new Date(`${quarter.slice(0, 4)}-${month < 10 ? `0${month}` : `${month}`}`)
}
