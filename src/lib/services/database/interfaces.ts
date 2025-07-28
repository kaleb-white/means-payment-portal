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

export interface UserServicesObj {}
export interface AuthServicesObj{}
export interface AnalyticsServicesObj {}
export interface AdminServicesObj{}

export interface UserServices {
    new(): UserServicesObj // Necessary because typescript infers this is a constructor interface not a class interface
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
    new(): AuthServicesObj
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
     * Signs out the user and redirects to the login page.
     * On an error, redirects to the login page with the error displayed.
     */
    signOut(): Promise<Error | null>
    /**
     * Performs auth checks before getting the current user from the session.
     * Implementation should perform the same auth checks the middleware is.
     * Redirects to /?error=${error.message} (login page) on an error.
     */
    getCurrentUser(): Promise<User>
}

export interface AnalyticsServices {
    new(): AnalyticsServicesObj
    /**
     * Concurrently fetches all reports from the database excluding the current report.
     * Implementation removes reports that don't exist or contain no reportData (which is stored as a JSONB field).
     * Implementation filters the JSONB data to remove all data not corresponding to the current user's coupon code.
     * @param user - The user returned by getCurrentUser. If no user is passed, user taken from session.
     * @param quarters - Either a number of quarters starting from the current quarter and counting backwards or an array of DateInYearQuarter objects.
     * @returns Either an array of reports or an Error.
     */
    getUserQuarterlyReports(quarters: number | DateInYearQuarter[], user?: User): Promise<ReportDataRow[] | Error>
    /**
     * Gets the in progress report, which is stored in its' own table.
     * @param user The user returned by getCurrentUser.
     * @returns Either a report or an Error.
     */
    getUserInProgressReport(user: User): Promise<ReportDataRow | Error>
    /**
     * -- ADMIN ROLE REQUIRED --
     * Gets quarterly reports for all users.
     * @param quarters Defaults to 2. Fetches that number of quarters, going backwards. Also works with a specific set of DateInYearQuarters.
     */
    getAllQuarterlyReports(quarters: number | DateInYearQuarter[]): Promise<QuarterlyReport[] | Error>

    createQuarterlyReport(report: string): Promise<boolean | Error>
    updateQuarterlyReport(quarter: DateInYearQuarter, report: string): Promise<boolean | Error>
    deleteQuarterlyReport(quarter: DateInYearQuarter): Promise<boolean | Error>
}

export interface AdminServices {
    new(): AdminServicesObj
    /**
     * Checks that the JWT property user_role is 'admin'.
     */
    isUserAdmin(): Promise<boolean>
    /**
     * Logs a user out if they are not an admin.
     */
    checkAdminRole(): Promise<null>
}
