import { quartersToYearsAndQuarters, financialToNumeric } from "@/format_converter";
import DatabaseContext from "../../../database/database_context";
import { AnalyticsServices, staticImplements } from "../../../database/interfaces";
import { supabaseClient } from "../supabase_client";
import { DateInYearQuarter, QuarterlyReport, ReportDataRow, ReportDataRowUncast, User } from "../../../database/schemas"
import { dbTableNames } from "@/configs";

@staticImplements<AnalyticsServices>()
export class SupabaseAnayticsService {
    static async getUserQuarterlyReports(quarters: number | DateInYearQuarter[], user?: User): Promise<ReportDataRow[] | Error> {
        'use server'
        const supabase = await supabaseClient()
        const tableName = (process.env.IS_PROD === '1') ? dbTableNames.quarterlyReports : dbTableNames.testQuarterlyReports
        const dbContext = await DatabaseContext()

        // If no user passed, get user from session
        if (!user) {
            user  = await dbContext.authService.getCurrentUser()
        }

        // If no user in the session, throw an error
        if (!user) {
            return new Error('No user passed to getUserQuarterlyReports or found in session')
        }

        // Get user (creator) coupon code
        const creatorCoupon = await dbContext.userService.getUserCouponByUser(user)

        let reportsToFetch: DateInYearQuarter[] = []

        if (typeof(quarters) === "number") {
            // Transform quarters into list of years and quarters
            reportsToFetch = quartersToYearsAndQuarters(quarters as number)
        } else {
            // There are 0 WAYS that quarters could be a number but whatever
            reportsToFetch = quarters as DateInYearQuarter[]
        }

        // Create promises to execute for each possible report
        const reportsAwaitable = reportsToFetch.map(yearAndQuarter => {
            return supabase.from(tableName)
                    .select('year, quarter, report_data')
                    .eq('year', yearAndQuarter.year)
                    .eq('quarter', yearAndQuarter.quarter)
        })

        // Run all promises
        const reports = (await Promise.all(reportsAwaitable))
                        .filter(e => e && e?.data && e?.data?.length !== 0) // Removes missing reports

        // Filter received reports by creator coupon code to create output reports only for creator with certain coupon code
        // Second map statement converts from list of list of objs to list of objs
        const filteredByCouponCodeUncast = reports.map(report => {
            // Get report
            const reportData = report?.data?.at(0)?.report_data
            if (!reportData) return null

            // Cast
            const reportDataCast = reportData as ReportDataRowUncast[]

            // Add filtered report to mapped filtered reports
            return reportDataCast.filter(creatorQuarterInfo => creatorQuarterInfo["Coupon Code"] === creatorCoupon)
        }).map(r => r![0])

        if (!filteredByCouponCodeUncast) return new Error("Fetching from database resulted in null.")

        // Cast to ReportDataRow
        const filteredByCouponCode = rdrUncastToCast(filteredByCouponCodeUncast)

        return filteredByCouponCode
    }

    static async getUserInProgressReport(user: User): Promise<ReportDataRow | Error> {
        'use server'
        const supabase = await supabaseClient()

        // Get user coupon code
        const creatorCoupon = await (await DatabaseContext()).userService.getUserCouponByUser(user)

        // Fetch from DB
        const { data, error } = await supabase.from('in_progress').select('*').eq("Coupon Code", creatorCoupon).limit(1)

        if (error) return error

        // Cast to ReportDataRow
        const castData = rdrUncastToCast(data)

        return castData[0]
    }

    static async getAllQuarterlyReports(quarters: number | DateInYearQuarter[] = 2): Promise<QuarterlyReport[] | Error> {
        'use server'
        // Check role
        const dbContext = await DatabaseContext()
        if (!await dbContext.adminService.isUserAdmin()) return new Error("Server action called by non admin")

        // Create DateInYearQuarters if necessary
        if (typeof(quarters) === 'number') {
            quarters = quarters + 1 // TODO: idk, eventually should get rid of current report it was stupid in the first place
            quarters = quartersToYearsAndQuarters(quarters)
        }

        // Create promises to exeute
        const supabase = await supabaseClient()
        const tableName = (process.env.IS_PROD === '1') ? dbTableNames.quarterlyReports : dbTableNames.testQuarterlyReports
        const reportsAwaitable = quarters.map(yearAndQuarter => {
            return supabase.from(tableName)
                .select('year, quarter, report_data')
                .eq('year', yearAndQuarter.year)
                .eq('quarter', yearAndQuarter.quarter)
        })

        // Run all promises
        const reports = (await Promise.all(reportsAwaitable))
                        .filter(e => e && e?.data && e?.data?.length !== 0) // Removes missing reports

        if (!reports) return new Error("No reports were returned by the database")

        return reports.map(report => (report.data![0] as QuarterlyReport))
    }

    static async getQuarterlyReportsRange(start: number, end: number): Promise<QuarterlyReport[] | Error> {
        'use server'
        // Check role
        const dbContext = await DatabaseContext()
        if (!await dbContext.adminService.isUserAdmin()) return new Error("Server action called by non admin")

        // Create promises to exeute
        const supabase = await supabaseClient()
        const tableName = (process.env.IS_PROD === '1')? dbTableNames.quarterlyReports : dbTableNames.testQuarterlyReports
        const reportsAwaitable = supabase.from(tableName)
            .select('year, quarter, report_data')
            .range(start, end)

        // Run promise
        const reports = await reportsAwaitable

        if (!reports) return new Error("No reports were returned by the database")

        return reports.data as QuarterlyReport[]
    }

    static async getQuarterlyReportsLength(): Promise<number | Error> {
        'use server'
        // Check role
        const dbContext = await DatabaseContext()
        if (!await dbContext.adminService.isUserAdmin()) return new Error("Server action called by non admin")

        const supabase = await supabaseClient()
        const res = await supabase.rpc('get_num_reports')
        if (res.error) return res.error
        return res.data
    }

    static async createQuarterlyReport(report: QuarterlyReport): Promise<boolean | Error> {
        'use server'
        // Check role
        const dbContext = await DatabaseContext()
        if (!await dbContext.adminService.isUserAdmin()) return new Error("Server action called by non admin")

        // Set up supabase
        const supabase = await supabaseClient()
        const tableName = (process.env.IS_PROD === '1') ? dbTableNames.quarterlyReports : dbTableNames.testQuarterlyReports

        // Check if the report is duplicate
        const match = await supabase.from(tableName)
            .select('year, quarter')
            .eq('year', report.year)
            .eq('quarter', report.quarter)
        if (match.count && match.count > 0) return new Error("Report exists for given year and quarter")

        // Insert the new report
        const { data, error } = await supabase
            .from(tableName)
            .insert([report])
            .select()

        // If error, return it
        if (error) return error
        if (!data) return new Error("No data was inserted as supabase returned no data")

        return true
    }

    static async updateQuarterlyReport(report: QuarterlyReport): Promise<boolean | Error> {
        'use server'
        // Check role
        const dbContext = await DatabaseContext()
        if (!await dbContext.adminService.isUserAdmin()) return new Error("Server action called by non admin")

        // Set up supabase
        const supabase = await supabaseClient()
        const tableName = (process.env.IS_PROD === '1') ? dbTableNames.quarterlyReports : dbTableNames.testQuarterlyReports

        // Make sure match exists
        const match = await supabase.from(tableName)
            .select('year, quarter')
            .eq('year', report.year)
            .eq('quarter', report.quarter)
        if (!match.data) return new Error("No data was returned")
        if (match.data.length !== 1) return new Error(match.data.length === 0 ? "No matching report was found" : "Multiple matching reports were found")

        // Perform update
        const { data, error } = await supabase
            .from(tableName)
            .update({ 'report_data': report.report_data })
            .eq('year', report.year)
            .eq('quarter', report.quarter)
            .select()

        // If error, return it
        if (error) return error
        if (!data) return new Error("No data was updated as database returned no data")

        return true
    }

    static async deleteQuarterlyReport(quarter: DateInYearQuarter): Promise<boolean | Error> {
        'use server'
        // Check role
        const dbContext = await DatabaseContext()
        if (!await dbContext.adminService.isUserAdmin()) return new Error("Server action called by non admin")

        // Set up supabase
        const supabase = await supabaseClient()
        const tableName = (process.env.IS_PROD === '1') ? dbTableNames.quarterlyReports : dbTableNames.testQuarterlyReports

        // Make sure match exists
        const match = await supabase.from(tableName)
            .select('year, quarter')
            .eq('year', quarter.year)
            .eq('quarter', quarter.quarter)
        if (!match.count || match.count !== 1) return new Error(match.count === 0 ? "No matching report was found" : "Multiple matching reports were found")

        // Perform delete
        const { error } = await supabase
            .from(tableName)
            .delete()
            .eq('year', quarter.year)
            .eq('quarter', quarter.quarter)

        // If error, return it
        if (error) return error

        return true
    }
}

// Helper for getUserQuarterly reports to cast from ReportDataRowUncast to ReportDataRowCast
function rdrUncastToCast(rdrUncast: ReportDataRowUncast[]): ReportDataRow[] {
    return rdrUncast.map(uncast => {
        return {
            Period: uncast.Period,
            Refunds: financialToNumeric(uncast.Refunds),
            "Coupon Code": uncast["Coupon Code"],
            "Net Revenue": financialToNumeric(uncast["Net Revenue"]),
            "Stripe Fees": financialToNumeric(uncast["Stripe Fees"]),
            "1/3 of Total": financialToNumeric(uncast["1/3 of Total"]),
            "Uscreen Fees": financialToNumeric(uncast["Uscreen Fees"]),
            "Gross Revenue": financialToNumeric(uncast["Gross Revenue"]),
            "Number of Subscribers": uncast["Number of Subscribers"],
            "Total (Net Revenue - Refund)": financialToNumeric(uncast["Total (Net Revenue - Refund)"]),
        }
    })
}
