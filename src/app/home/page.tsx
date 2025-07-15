import { DatabaseContext } from "@/lib/services/database/database_context"
import AnalyticsContainer from "./anlytics_container"

import { Suspense } from "react"
import { AnalyticsLoading } from "../_client_ui/suspense"

export default async function Analytics() {

    const user = await DatabaseContext().authService.getCurrentUser()

    const initialnAnalyticsData = DatabaseContext().analyticsService.getUserQuarterlyReports(user, 2)
    const currentData = DatabaseContext().analyticsService.getUserInProgressReport(user)

    return (
        <div className="flex flex-row justify-center gap-2 md:gap-4">
            <div className="p-4 w-full flex flex-col justify-center text-left">

                <p className="text-white means-underline text-l md:text-2xl">{`Hello, ${user.email}`}</p>
                <Suspense fallback={<AnalyticsLoading />} >
                    <AnalyticsContainer initialDataStream={initialnAnalyticsData} initialCurrentDataStream={currentData} />
                </Suspense>

            </div>
        </div>
    )
}
