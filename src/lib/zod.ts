import * as z from "zod"

export const signInSchema = z.object({
    email: z.email("Submitted email invalid"),
    password: z.string().min(1, "Must be at least one character")
})

export const DateInYearQuarterSchema = z.object({
    year: z.string(),
    quarter: z.string()
})

export const dateInYearQuarterArray = z.array(
    DateInYearQuarterSchema
)

export const ReportDataRowUncastSchema = z.object({
    Period: z.string(),
    Refunds: z.string(),
    "Coupon Code": z.string(),
    "Net Revenue": z.string(),
    "Stripe Fees": z.string(),
    "1/3 of Total": z.string(),
    "Uscreen Fees": z.string(),
    "Gross Revenue": z.string(),
    "Number of Subscribers": z.number(),
    "Total (Net Revenue - Refund)": z.string()
})

export const QuarterlyReportSchema = z.object({
    year: z.number(),
    quarter: z.number(),
    report_data: z.array(ReportDataRowUncastSchema)
})

export const RangeSchema = z.object({
    start: z.number(),
    stop: z.number()
})
