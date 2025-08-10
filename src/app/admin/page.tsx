'use server'

import DatabaseContext from "@/lib/database/database_context"
import PaginatedReports from "./_admin_ui/paginated_reports"
import { CreateReport } from "./_admin_ui/create_report"
import Header from "../_client_ui/header"
import PaginatedCouponCodes from "./_admin_ui/paginated_coupon_codes"

export default async function Analytics() {
    const dbContext = await DatabaseContext()
    const initialReports = dbContext.analyticsService.getAllQuarterlyReports(5)
    const numReports = dbContext.analyticsService.getQuarterlyReportsLength()
    const couponCode = dbContext.userService.getAllCouponCodes()

    return (
        <div className="flex flex-col md:flex-row gap-5 md:gap-8">
            <div className="flex flex-col min-w-1/4 w-fit gap-2">
                <Header text="Edit Reports" textSize="xl"/>
                <PaginatedReports initialReports={initialReports} numReports={numReports} />
            </div>
            <div className="flex flex-col w-fit gap-2 md:max-w-1/4">
                <Header text="Add New Reports" textSize="xl"/>
                <CreateReport />
            </div>
            <div className="flex flex-col w-fit md:max-w-1/4 gap-2">
                <Header text="Edit Coupon Codes" textSize="xl"/>
                <PaginatedCouponCodes initialCouponCodes={couponCode}/>
            </div>
            <div className="flex flex-col w-fit gap-2">
                <Header text="Edit Coupon Codes" textSize="xl"/>
            </div>
        </div>
    )
}
