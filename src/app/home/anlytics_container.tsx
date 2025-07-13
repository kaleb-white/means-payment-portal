'use client'
import { ReportDataRow } from "@/lib/services/database/interfaces"

import { use } from "react"

export default function AnalyticsContainer({
    initialDataStream,
    initialCurrentDataStream
}: {
    initialDataStream: Promise<Error | ReportDataRow[]>,
    initialCurrentDataStream: Promise<Error | ReportDataRow>
}) {
    const initialData = use(initialDataStream)
    const initialCurrentData = use(initialCurrentDataStream)

    let error: Error | null = null

    if (initialData instanceof Error) {
        error = initialData
    } else if (initialCurrentData instanceof Error) {
        error = initialCurrentData
    } else {
        initialData.push(initialCurrentData)
    }

    if (error) {
        return (<></>)
    } else {
        return (<div className="flex flex-col justify"></div>)
    }
}
