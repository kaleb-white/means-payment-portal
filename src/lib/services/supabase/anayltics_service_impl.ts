import { DatabaseContext } from "../database/database_context";
import { AnalyticsServices, ReportDataRow, ReportDataRowUncast, User } from "../database/interfaces";
import { supabaseClient } from "./supabase_client";

export class SupabaseAnayticsService implements AnalyticsServices {
    async getUserQuarterlyReports(user: User, quarters: number = 10): Promise<ReportDataRow[] | Error> {
        const supabase = await supabaseClient()

        // Get user (creator) coupon code
        const creatorCoupon = await DatabaseContext().userService.getUserCouponByUser(user)

        // Transform quarters into list of years and quarters
        const reportsToFetch = this.quartersToYearsAndQuarters(quarters)

        // Create promises to execute for each possible report
        const reportsAwaitable = reportsToFetch.map(yearAndQuarter => {
            return supabase.from('quarterly_reports')
                    .select('year, quarter, report_data')
                    .eq('year', yearAndQuarter.year)
                    .eq('quarter', yearAndQuarter.quarter)
        })

        // Run all promises
        const reports = (await Promise.all(reportsAwaitable))
                        .filter(e => e?.data?.length !== 0) // Removes msising reports

        // Filter received reports by creator coupon code to create output reports only for creator with certain coupon code
        const filteredByCouponCodeUncast = reports.map(report => {
            // Get report
            const reportData = report?.data?.at(0)?.report_data
            if (!reportData) return null

            // Cast
            const reportDataCast = reportData as ReportDataRowUncast[]

            // Add filtered report to mapped filtered reports
            return reportDataCast.filter(creatorQuarterInfo => creatorQuarterInfo["Coupon Code"] === creatorCoupon)
        })[0]

        if (!filteredByCouponCodeUncast ) return new Error("Fetching from database resulted in null.")

        // Cast to ReportDataRow
        const filteredByCouponCode = this.rdrUncastToCast(filteredByCouponCodeUncast)

        return filteredByCouponCode
    }

    // Helper for getUserQuarterlyReports to create the reports to get from a number of quarters
    quartersToYearsAndQuarters(quarters: number) {
        let year = new Date().getFullYear()
        let quarter = Math.floor((new Date().getMonth() + 3) / 3) - 1 // Subtract 1 because current quarter still in progress
        const returnArray = []
        for (let _ = quarters; _ >= 1 ; _--) {
            returnArray.push({year: String(year), quarter: String(quarter)})
            quarter--
            if (quarter === 0) {
                year--
                quarter = 4
            }
        }
        return returnArray
    }

    // Helper for getUserQuarterly reports to cast from ReportDataRowUncast to ReportDataRowCast
    rdrUncastToCast(rdrUncast: ReportDataRowUncast[]): ReportDataRow[] {
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

    async getUserInProgressReport(user: User): Promise<ReportDataRow | Error> {
        const supabase = await supabaseClient()

        // Get user coupon code
        const creatorCoupon = await DatabaseContext().userService.getUserCouponByUser(user)

        // Fetch from DB
        const { data, error } = await supabase.from('in_progress').select('*').eq("Coupon Code", creatorCoupon).limit(1)

        if (error) return error

        // Cast to ReportDataRow
        const castData = this.rdrUncastToCast(data)

        return castData[0]
    }
}
