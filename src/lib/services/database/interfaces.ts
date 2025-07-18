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

export interface DateInYearQuarter {
    year: string,
    quarter: string
}

export interface UserServices {
    /**
     * Not yet implemented
     * @param id
     */
    getUserById(id: string): Promise<User | null>
    /**
     * Not yet implemented
     * @param id
     * @param updates
     */
    updateUser(id: string, updates: Partial<User>): Promise<User>
    /**
     * Not yet implemented
     * @param id
     */
    deleteUser(id: string): Promise<void>
    /**
     * Gets the user's coupon code. Does not perform auth checks.
     * @param user - The current user, as returned by getCurrentUser.
     * @returns A string containing the users unique coupon code.
     */
    getUserCouponByUser(user: User): Promise<string | null>
}

export interface AuthServices {
    /**
     * Signs up the user. Does not return the user because their session should be set going forward.
     * PERFORM VALIDATION BEFORE USING!
     * @param email - The user's submitted email.
     * @param password - The user's submitted password.
     * @returns Null on success, an error if the database returned an error.
     */
    signUp(email: string, password: string): Promise<Error | null>
    /**
     * Signs in the user. Does not return the user because their session should be set going forward.
     * PERFORM VALIDATION BEFORE USING!
     * @param email - The user's submitted email.
     * @param password - The user's submitted password.
     * @returns Null on success, an error if the database returned an error.
     */
    signIn(email: string, password: string): Promise<Error | null>
    /**
     * Not implemented.
     */
    signOut(): Promise<void>
    /**
     * Performs auth checks before getting the current user from the session.
     * Implementation should perform the same auth checks the middleware is.
     * Redirects to /?error=${error.message} (login page) on an error.
     */
    getCurrentUser(): Promise<User>
}

export interface AnalyticsServices {
    /**
     * Concurrently fetches all reports from the database excluding the current report.
     * Implementation removes reports that don't exist or contain no reportData (which is stored as a JSONB field).
     * Implementation filters the JSONB data to remove all data not corresponding to the current user's coupon code.
     * @param user - The user returned by getCurrentUser.
     * @param quarters - Either a number of quarters starting from the current quarter and counting backwards or an array of DateInYearQuarter objects.
     * @returns Either an array of reports or an Error.
     */
    getUserQuarterlyReports(user: User, quarters: number | DateInYearQuarter[]): Promise<ReportDataRow[] | Error>
    /**
     * Gets the in progress report, which is stored in its' own table.
     * @param user - The user returned by getCurrentUser.
     * @returns Either a report or an Error.
     */
    getUserInProgressReport(user: User): Promise<ReportDataRow | Error>
}
