import { DatabaseContext } from "../database/database_context";
import { AnalyticsServices, ReportDataRow, User } from "../database/interfaces";
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

        // Filter received reports by creator coupon code
        const filteredByCouponCode = reports.map(report => {
            const reportData = report?.data?.at(0)?.report_data
            if (!reportData) return null
            const reportDataCast = reportData as ReportDataRow[]
            return reportDataCast.filter(creatorQuarterInfo => creatorQuarterInfo["Coupon Code"] === creatorCoupon)
        })[0]

        if (!filteredByCouponCode) return new Error("Fetching from database resulted in null.")

        return filteredByCouponCode
    }

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
}
