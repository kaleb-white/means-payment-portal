export interface User { // Modeled on (a partial of) supabase user obj: https://supabase.com/docs/guides/auth/users
    id: string // Unique User ID (UUID)
    aud: string // The 'audience claim', JWT token describing access service or addres
    role: string // For Row Level Security (RLS) checks
    email: string // The user's email address
    confirmed_at: string // Timestamp the user confirmed their email at
    last_sign_in_at: string // Timestamp since user last signed in
    created_at: string // Timestamp user was created at
    updated_at: string // Timestamps user was updated at
}

export interface QuarterlyReport {
    year: number
    quarter: number
    report_data: ReportDataRowUncast[]
}

export interface ReportDataRowUncast {
    Period: string
    Refunds: string
    "Coupon Code": string
    "Net Revenue": string
    "Stripe Fees": string
    "1/3 of Total": string
    "Uscreen Fees": string
    "Gross Revenue": string
    "Number of Subscribers": number
    "Total (Net Revenue - Refund)": string
}

export interface ReportDataRow {
    Period: string
    Refunds: number
    "Coupon Code": string
    "Net Revenue": number
    "Stripe Fees": number
    "1/3 of Total": number
    "Uscreen Fees": number
    "Gross Revenue": number
    "Number of Subscribers": number
    "Total (Net Revenue - Refund)": number
}

// Has corresponding Zod schema
export interface DateInYearQuarter {
    year: string,
    quarter: string
}
