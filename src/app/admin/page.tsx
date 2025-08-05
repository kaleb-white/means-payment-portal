'use server'

import DatabaseContext from "@/lib/database/database_context"
import PaginatedReports from "./_admin_ui/paginated_reports"
import { CreateReport } from "./_admin_ui/create_report"

export default async function Analytics() {
    const dbContext = await DatabaseContext()
    const initialReports = dbContext.analyticsService.getAllQuarterlyReports(5)
    const numReports = dbContext.analyticsService.getQuarterlyReportsLength()

    return (
        <div className="flex flex-col md:flex-row">
            <div className="flex flex-col w-1/4 gap-2">
                <PaginatedReports initialReports={initialReports} numReports={numReports} />
                <CreateReport />
            </div>
        </div>
    )
}
