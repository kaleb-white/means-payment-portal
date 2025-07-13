import { DatabaseContext } from "@/lib/services/database/database_context"
import AnalyticsContainer from "./anlytics_container"

import { Suspense } from "react"

async function Loading() {
    return (
        <div className="animate-pulse means-border w-full md:w-4/5 h-96 mx-auto p-4 md:p-4 my-4 md:my-8 flex flex-col gap-4">
            <div className="w-full h-full rounded-sm bg-gray-600 mx-auto"></div>

            <div className="flex flex-row justify-items-center items-center min-w-full">
                <div className="w-24 h-12 rounded-sm bg-gray-600 mx-auto"></div>
                <div className="md:hidden w-48 h-12 rounded-sm bg-gray-600 mx-auto"></div>

                <div className="hidden md:block w-36 h-12 rounded-sm bg-gray-600 mx-auto"></div>
                <div className="hidden md:block w-36 h-12 rounded-sm bg-gray-600 mx-auto"></div>
                <div className="hidden md:block w-36 h-12 rounded-sm bg-gray-600 mx-auto"></div>
                <div className="hidden md:block w-36 h-12 rounded-sm bg-gray-600 mx-auto"></div>
            </div>

            <div className="w-30 md:w-60 h-6 bg-gray-600 justify-self-start"></div>
            <div className="w-36 md:w-70 h-6 bg-gray-600 justify-self-start"></div>
        </div>
    )
}

export default async function Analytics() {

    const user = await DatabaseContext().authService.getCurrentUser()

    const initialnAnalyticsData = DatabaseContext().analyticsService.getUserQuarterlyReports(user, 2)
    const currentData = DatabaseContext().analyticsService.getUserInProgressReport(user)

    return (
        <div className="flex flex-row justify-center gap-2 md:gap-4">
            <div className="p-4 w-full md:w-4/5 flex flex-col justify-center align-center text-left">

                <p className="text-white means-underline text-l md:text-2xl">{`Hello, ${user.email}`}</p>
                <Loading  />
                <Suspense fallback={<Loading />} >
                    <AnalyticsContainer initialDataStream={initialnAnalyticsData} initialCurrentDataStream={currentData} />
                </Suspense>

            </div>
        </div>
    )
}
