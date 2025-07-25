'use client'
import { analyticsConfig, graphConfig } from "@/configs"
import { ReportDataRow } from "@/lib/services/database/interfaces"

import { AnalyticsProperties } from "../_interfaces/types"
import Graph from "./graph"
import Controls from "./controls"

import { startTransition, use, useActionState, useEffect, useRef, useState } from "react"
import { quartersToYearsAndQuarters, quarterToDateInYearQuarter } from "@/format_converter"
import clsx from "clsx"

export default function AnalyticsContainer({
    initialDataStream,
    initialCurrentDataStream
}: {
    initialDataStream: Promise<Error | ReportDataRow[]>,
    initialCurrentDataStream: Promise<Error | ReportDataRow>
}) {
    // Graph controls
    const [graphProperty, setGraphProperty] = useState(analyticsConfig.defaultProperty as AnalyticsProperties)
    const [quarters, setQuartersPrevious] = useState(analyticsConfig.defaultQuarters as number)

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
    const currentQuartersArray = useRef(quartersToYearsAndQuarters(quarters)) // Start at 4
    const currentQuartersFetched = useRef(reportData instanceof Error? [] : reportData) // Start at report data
    const [_, action, pending] = useActionState(
        async () => {
            // Get the quarters that need fetched
            const quartersConverted = quartersToYearsAndQuarters(quarters)

            // Filter out any that we already have
            const quartersToFetch = quartersConverted.filter(q => {
                return currentQuartersArray.current.every(cq => {
                    if (cq.quarter === q.quarter && cq.year === q.year) return false
                    return true
                })
            })

            // If there aren't any to fetch, skip the fetching (ie, quarter amt decreased)
            if (quartersToFetch.length > 0) {
                // Fetch the quarters
                const response = await fetch('api/get-quarterly-reports', {
                    method: 'POST',
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(quartersToFetch)
                })
                if (response.status !== 200) {
                    return // TODO
                }
                const r = await response.json() as Array<ReportDataRow>

                // Since we succesfully fetched the quarters, update quarters we have
                currentQuartersArray.current = currentQuartersArray.current.concat(quartersToFetch)
                currentQuartersFetched.current = currentQuartersFetched.current.concat(r)
            }

            // Filter all the reports we have by the current number of quarters
            setReportData(currentQuartersFetched.current.filter(
                q => !quartersConverted.every(cq => {
                    const qAsYearQuarter = quarterToDateInYearQuarter(q.Period)
                    if (cq.quarter === qAsYearQuarter.quarter && cq.year === qAsYearQuarter.year) return false
                    return true

                })
            ))
        },
        null
    )

    // Call our action on hydration
    useEffect (() => {
        async function transitionReportData() {startTransition(action)}
        transitionReportData()
    }, [quarters, action])

    if (reportData instanceof Error) {
        return (<>{reportData.message}</>)
    } else {
        return (
            <div className="flex flex-col mx-auto means-border md:justify-center p-2 md:p-8 my-4 md:my-8 gap-4 text-black">
                <div className={clsx(`w-full md:w-[${graphConfig.graphWidthMax}px] md:h-[${graphConfig.graphHeight}px]`)}>
                    <Graph reportDataUnsorted={reportData} property={graphProperty} maxWidth={graphConfig.graphWidthMax} height={graphConfig.graphHeight}/>
                </div>
                <Controls
                    reportData={reportData}
                    setGraphProperty={setGraphProperty} setQuartersPrevious={setQuartersPrevious}
                    graphProperty={graphProperty} quarters={quarters} changePending={pending}
                />
            </div>
        )
    }
}
