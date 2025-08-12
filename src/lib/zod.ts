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

const financial = z.string().regex(/^\$((([0-9]{1,3},)?([0-9]{3},)*[0-9]{3}|[0-9]{1,3})(\.[0-9]{2})?)$/)

export const ReportDataRowUncastSchema = z.object({
    Period: z.string(),
    Refunds: financial,
    "Coupon Code": z.string(),
    "Net Revenue": financial,
    "Stripe Fees": financial,
    "1/3 of Total": financial,
    "Uscreen Fees": financial,
    "Gross Revenue": financial,
    "Number of Subscribers": z.number(),
    "Total (Net Revenue - Refund)": financial
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

export const FileSchema = z.file().mime("text/csv")

export const CouponCodeSchema = z.object({
    email: z.email(),
    couponCode: z.string()
})
