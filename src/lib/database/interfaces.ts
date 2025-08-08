import { CouponCode, DateInYearQuarter, QuarterlyReport, ReportDataRow, User } from "./schemas"

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
     * @param user The current user, as returned by getCurrentUser.
     * @returns A string containing the users unique coupon code.
     */
    getUserCouponByUser(user: User): Promise<string | null>
    /**
     * ** ADMIN ROLE REQUIRED **
     * @param email The user's email.
     */
    getUserCouponByEmail(email: string): Promise<CouponCode| Error>
    /**
     * ** ADMIN ROLE REQUIRED **
     * @returns All coupon codes and users, or an error.
     */
    getAllCouponCodes(): Promise<Array<CouponCode> | Error>
    /**
     * ** ADMIN ROLE REQUIRED **
     * Assosciates an email with a coupon code.
     * @param email
     * @param couponCode
     */
    createCouponCode(email: string, couponCode: string): Promise<boolean | Error>
    /**
     * ** ADMIN ROLE REQUIRED **
     * Updates the coupon code assosciated with an email.
     * @param email The email used to select the coupon code.
     * @param couponCode The coupon code to be changed.
     */
    updateCouponCode(email: string, couponCode: string): Promise<boolean | Error>
    /**
     * ** ADMIN ROLE REQUIRED **
     * Updates the coupon code assosciated with an email.
     * @param email The email to be changed.
     * @param couponCode The coupon code used to select the email.
     */
    updateEmailInCouponCode(email: string, couponCode: string): Promise<boolean | Error>
    /**
     * ** ADMIN ROLE REQUIRED **
     * Deletes a coupon code and email.
     * @param email
     * @param couponCode
     */
    deleteCouponCode(email:string, couponCode: string): Promise<boolean | Error>
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
     * ** ADMIN ROLE REQUIRED **
     * Gets quarterly reports for all users.
     * @param quarters Defaults to 2. Fetches that number of quarters, going backwards. Also works with a specific set of DateInYearQuarters.
     */
    getAllQuarterlyReports(quarters: number | DateInYearQuarter[]): Promise<QuarterlyReport[] | Error>
    /**
     * ** ADMIN ROLE REQUIRED **
     * Fetches quarterly reports in the range start to end, inclusive.
     * @param start The record # to start with.
     * @param end The record # to end with.
     */
    getQuarterlyReportsRange(start: number, end: number): Promise<QuarterlyReport[] | Error>
    /**
     * ** ADMIN ROLE REQUIRED **
     * Gets the length of the quarterly reports table.
     */
    getQuarterlyReportsLength(): Promise<number | Error>
    /**
     * ** ADMIN ROLE REQUIRED **
     * Creates a new quarterly report. Returns an error if db does or if report is duplicate.
     * @param report A QuarterlyReport object. Does not perform validation!
     */
    createQuarterlyReport(report: QuarterlyReport): Promise<boolean | Error>
    /**
     * ** ADMIN ROLE REQUIRED **
     * Updates a quarterly report. Current implementation just replaces jsonb value in db.
     * @param report A QuarterlyReport object. Does not perform validation!
     */
    updateQuarterlyReport(report: QuarterlyReport): Promise<boolean | Error>
    /**
     * ** ADMIN ROLE REQUIRED **
     * Deletes a quarterly report.
     * @param quarter A DateInYearQuarter object. Returns an error if multiple or no matching rows exist.
     */
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

/**
 * Credit to https://stackoverflow.com/questions/13955157/how-to-define-static-property-in-typescript-interface
 * Use this to get a warning if an interface is not fulfilled
 */
export function staticImplements<T>() {
    return <U extends T>(constructor: U) => {constructor};
}
