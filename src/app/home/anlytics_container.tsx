'use client'
import { analyticsConfig } from "@/configs"
import { ReportDataRow } from "@/lib/services/database/interfaces"

import { AnalyticsProperties } from "../_interfaces/types"
import Graph from "./graph"
import Controls from "./controls"

import { startTransition, use, useActionState, useEffect, useRef, useState } from "react"
import { quartersToYearsAndQuarters } from "@/format_converter"

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

    // Report data
    const [reportData, setReportData] = useState(
        (!(initialData instanceof Error) && !(initialCurrentData instanceof Error))?
        initialData.concat(initialCurrentData) :
        new Error("Report data failed to load.")
    )

    // Fetch new report data
    const preventInitial = useRef(true)
    const [_, action, pending] = useActionState(
        async () => {
            const quartersConverted = quartersToYearsAndQuarters(quartersPrevious)
            const response = await fetch('api/get-quarterly-reports', {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(quartersConverted)
            })
            if (response.status !== 200) {
                return // TODO
            }
            const r = await response.json() as Array<ReportDataRow>
            if (!(initialCurrentData instanceof Error)) {
                r.push(initialCurrentData)
            }
            setReportData(r)
        },
        null
    )

    useEffect (() => {
        if (preventInitial.current) {preventInitial.current = false; return}
        async function transitionReportData() {startTransition(action)}
        transitionReportData()
    }, [quartersPrevious, action])

    if (reportData instanceof Error) {
        return (<>{reportData.message}</>)
    } else {
        return (
            <div className="flex flex-col mx-auto means-border md:justify-center p-2 md:p-8 my-4 md:my-8 gap-4 text-black">
                <div className="w-full md:w-[1000px] md:h-[300px]">
                    <Graph reportDataUnsorted={reportData} property={graphProperty} maxWidth={1000} height={300}/>
                </div>
                <Controls
                    reportData={reportData}
                    setGraphProperty={setGraphProperty} setQuartersPrevious={setQuartersPrevious}
                    graphProperty={graphProperty} quartersPrevious={quartersPrevious} changePending={pending}
                />
            </div>
        )
    }
}
