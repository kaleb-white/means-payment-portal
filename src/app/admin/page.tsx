'use server'

import DatabaseContext from "@/lib/database/database_context"
import PaginatedReports from "./_admin_ui/paginated_reports"

export default async function Analytics() {
    const dbContext = await DatabaseContext()
    const initialReports = dbContext.analyticsService.getAllQuarterlyReports(5)
    const numReports = dbContext.analyticsService.getQuarterlyReportsLength()

    return (
        <div>
            <PaginatedReports initialReports={initialReports} numReports={numReports} />
        </div>
    )
}
