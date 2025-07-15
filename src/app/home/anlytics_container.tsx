'use client'
import { analyticsConfig } from "@/constants"
import { ReportDataRow } from "@/lib/services/database/interfaces"

import { use, useState } from "react"
import Graph from "./graph"
import { AnalyticsProperties } from "../_interfaces/types"

export default function AnalyticsContainer({
    initialDataStream,
    initialCurrentDataStream
}: {
    initialDataStream: Promise<Error | ReportDataRow[]>,
    initialCurrentDataStream: Promise<Error | ReportDataRow>
}) {
    // Graph controls
    const [graphProperty, setGraphProperty] = useState(analyticsConfig.defaultProperty as AnalyticsProperties)
    const [quartersPrevious, setQuartersPrevious] = useState(analyticsConfig.defaultQuarters as number)

    // Graph data
    const initialData = use(initialDataStream)
    const initialCurrentData = use(initialCurrentDataStream)

    let reportData: ReportDataRow[] = []

    if (!(initialData instanceof Error) && !(initialCurrentData instanceof Error)) {
        reportData = initialData.concat([initialCurrentData])
    }

    if (initialData instanceof Error || initialCurrentData instanceof Error) {
        return (<></>)
    } else {
        return (
            <div className="flex flex-col mx-auto means-border md:justify-center p-8 my-4 md:my-8 gap-4 text-black">
                <div className="w-full md:w-[1000px] md:h-[400px]">
                    <Graph reportData={reportData} property={graphProperty} width={1000} height={400}/>
                </div>
            </div>
        )
    }
}
