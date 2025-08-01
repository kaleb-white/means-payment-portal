import { ReportDataRow } from "@/lib/database/schemas"

export const AnalyticsPropertiesAsArray = [
    "Net Revenue",
    "Stripe Fees",
    "1/3 of Total",
    "Uscreen Fees",
    "Gross Revenue",
    "Number of Subscribers",
    "Total (Net Revenue - Refund)",
    "Refunds"
]

export type AnalyticsKeys = keyof ReportDataRow

export type AnalyticsProperties = Exclude<AnalyticsKeys,
    "Period" |
    "Coupon Code"
>

export function isNumericPropertyUncast(prop: string): boolean {
    if (prop === "Number of Subscribers") return true
    return false
}
