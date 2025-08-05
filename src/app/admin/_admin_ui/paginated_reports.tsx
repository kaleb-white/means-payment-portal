'use client'

import Error from "@/app/_client_ui/error";
import { Spinner } from "@/app/_client_ui/spinner";
import { QuarterlyReport, Range } from "@/lib/database/schemas";
import clsx from "clsx";
import { startTransition, use, useActionState, useEffect, useState } from "react";
import Controls from "@/app/_client_ui/pagination_controls";
import { Quarter } from "./quarter";

export default function PaginatedReports ({
    initialReports,
    numReports,
    REPORTSPERPAGE=5
}: {
    initialReports: Promise<QuarterlyReport[] | Error>,
    numReports: Promise<number | Error>,
    REPORTSPERPAGE?: number
}) {
    // Pagination controls
    const [pageNumber, setPageNumber] = useState(1)

    // Reports
    let reportsLength = use(numReports)
    let initReports = use(initialReports)
    const [reports, setReports] = useState(initReports)
    const [rangesFetched, setRangesFetched] = useState<number[]>(
        !(initReports instanceof Error)?
            // Calling python / php 'range' function on the math.floor calculation, essentially
            [...Array(
                Math.floor(
                    (initReports as QuarterlyReport[]).length / REPORTSPERPAGE)
                ) // Call array constructor on floor of number of reports, which returns an array with n empty spots
                .keys() // Get the keys, which are the indices
            ].map(pn => pn + 1) // Increase the keys by 1, since the indices start at 0 but page numbers start at 1
            : [1]
    ) // Not used for rendering, ref would work here too

    // Fetch new reports
    const [error, setError] = useState<string | null>(null)
    const [_, action, pending] = useActionState(
        async () => {
            // Reports are already fetched for this range
            if (rangesFetched.includes(pageNumber)) {setError(null); return}

            // Fetch the reports
            const range: Range = {
                start: (pageNumber - 1) * REPORTSPERPAGE,
                stop: (pageNumber * REPORTSPERPAGE) - 1
            }
            const response = await fetch('api/analytics/get-quarterly-reports-range', {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(range)
            })

            // Handle an error; display to user
            if (response.status !== 200) {
                setError(response.statusText)
                return
            }

            // Reset error
            setError(null)

            const responseData = await response.json() as QuarterlyReport[]

            // Since data was succesfully fetched, add page number to list of pages we have
            setRangesFetched(prev => [...prev, pageNumber])

            // Resize reports array if necessary
            const curr = reports as QuarterlyReport[]
            const reportsExtended = curr.concat(new Array(Math.max(0, pageNumber * REPORTSPERPAGE - curr.length)))

            // Slice sections
            const before = reportsExtended.slice(0, (pageNumber - 1) * REPORTSPERPAGE)
            const after = reportsExtended.slice(pageNumber * REPORTSPERPAGE)

            // Set reports
            setReports(
                before.concat(responseData).concat(after)
            )
        },
        null
    )

    // On page change, update reports
    useEffect(() => {
        async function transitionReportData() {startTransition(action)}
        transitionReportData()
    }, [pageNumber])


    if (reports instanceof Error || reportsLength instanceof Error) {
        return (
            <div className="flex flex-col means-border">
                <Error text={(reports as Error).message} hidden={!(reports instanceof Error)} />
                <Error text={(reportsLength as Error).message} hidden={!(reportsLength instanceof Error)} />
            </div>
        )
    }
    return (
        <div className="flex flex-col means-border w-full">
            {/* Reports */}
            <div className="flex flex-col md:relative">
                <div className="flex flex-col items-center">
                    {pending? <Spinner /> : <></>}
                </div>
                {(reports as QuarterlyReport[])
                    .slice((pageNumber - 1) * REPORTSPERPAGE, pageNumber * REPORTSPERPAGE)
                    .map((r, i) => {return (
                        <div className={clsx("relative md:static hover:bg-means-bg-hover cursor-pointer", `z-${i}`)} key={i}>
                            <Quarter quarter={r}/>
                        </div>
                    )})
                }
            </div>
            {/* Controls */}
            <Controls currentPage={pageNumber} pageSetter={setPageNumber} numPages={Math.ceil((reportsLength as number) / REPORTSPERPAGE)} />
            {/* Error */}
            <Error text={error? error: ''} hidden={error? false: true} />
        </div>
    )
}
