'use server'

import DatabaseContext from "@/lib/database/database_context"
import PaginatedReports from "./_admin_ui/reports/paginated_reports"
import Header from "../_client_ui/header"
import PaginatedCouponCodes from "./_admin_ui/coupon_codes/paginated_coupon_codes"
import { CreateObjsFromFile } from "./_admin_ui/create_objs_from_file"
import { CouponCode, QuarterlyReport } from "@/lib/database/schemas"
import { parseCsvAsCouponCode, parseCsvAsQuarterlyReport } from "../_client_utilities/parse_csv"
import { apiRoutes } from "@/configs"

export default async function Analytics() {
    const dbContext = await DatabaseContext()
    const initialReports = dbContext.analyticsService.getAllQuarterlyReports(5)
    const numReports = dbContext.analyticsService.getQuarterlyReportsLength()
    const couponCode = dbContext.userService.getAllCouponCodes()

    return (
        <div className="flex flex-col md:flex-row gap-5 md:gap-8">
            <div className="flex flex-col min-w-1/4 w-fit max-w-full gap-2">
                <Header text="Edit Reports" textSize="xl"/>
                <PaginatedReports initialReports={initialReports} numReports={numReports} />
            </div>
            <div className="flex flex-col w-fit max-w-full gap-2 md:max-w-1/5">
                <Header text="Add New Reports" textSize="xl"/>
                <CreateObjsFromFile<QuarterlyReport> fileParser={parseCsvAsQuarterlyReport} apiEndpoint={apiRoutes.createQuarterlyReport}/>
            </div>
            <div className="flex flex-col w-fit max-w-full gap-2 md:max-w-1/4">
                <Header text="Edit Coupon Codes" textSize="xl"/>
                <PaginatedCouponCodes initialCouponCodes={couponCode}/>
            </div>
            <div className="flex flex-col w-fit max-w-full gap-2 md:max-w-1/5">
                <Header text="Add New Coupon Codes" textSize="xl"/>
                <CreateObjsFromFile<CouponCode> fileParser={parseCsvAsCouponCode} apiEndpoint={apiRoutes.createCouponCode}/>
            </div>
        </div>
    )
}
