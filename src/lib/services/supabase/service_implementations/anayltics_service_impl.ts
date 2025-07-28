import { quartersToYearsAndQuarters } from "@/format_converter";
import { DatabaseContext } from "../../database/database_context";
import { AnalyticsServicesObj, DateInYearQuarter, QuarterlyReport, ReportDataRow, ReportDataRowUncast, User } from "../../database/interfaces";
import { supabaseClient } from "../supabase_client";

export class SupabaseAnayticsService implements AnalyticsServicesObj {
    static async getUserQuarterlyReports(quarters: number | DateInYearQuarter[], user?: User): Promise<ReportDataRow[] | Error> {
        'use server'
        const supabase = await supabaseClient()
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
            return supabase.from('quarterly_reports')
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
        await dbContext.adminService.isUserAdmin()

        // Create DateInYearQuarters if necessary
        if (typeof(quarters) === 'number') {
            quarters = quarters + 1 // TODO: idk get rid of current report it was stupid in the first place
            quarters = quartersToYearsAndQuarters(quarters)
            console.log(quarters)
        }

        // Create promises to exeute
        const supabase = await supabaseClient()
        const reportsAwaitable = quarters.map(yearAndQuarter => {
            return supabase.from('quarterly_reports')
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


}

// Helper for getUserQuarterly reports to cast from ReportDataRowUncast to ReportDataRowCast
function rdrUncastToCast(rdrUncast: ReportDataRowUncast[]): ReportDataRow[] {
    function financialToNumeric(financial: string) {
        return Number(financial.slice(1, ).replace(",", ""))
    }

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
