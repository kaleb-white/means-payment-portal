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
