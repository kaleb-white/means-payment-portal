'use client'

import { AnalyticsProperties, AnalyticsPropertiesAsArray, isNumericPropertyUncast } from "@/app/_client_interfaces/types";
import Error from "@/app/_client_ui/error";
import { Check, Spinner } from "@/app/_client_ui/spinner";
import useControlOpen from "@/app/_custom_hooks/use_control_open";
import { financialToNumeric, numberToFinancial } from "@/format_converter";
import { QuarterlyReport, Range, ReportDataRowUncast } from "@/lib/database/schemas";
import clsx from "clsx";
import { createContext, Dispatch, ReactNode, RefObject, SetStateAction, startTransition, use, useActionState, useContext, useEffect, useRef, useState } from "react";

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
            [...Array(Math.floor((initReports as QuarterlyReport[]).length / REPORTSPERPAGE)).keys()]
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
        <div className="flex flex-col means-border w-full md:w-1/4">
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

function Quarter ({
    quarter
}: {
    quarter: QuarterlyReport
}) {
    // Data to display
    const [numberOfCodes, _] = useState(new Set(quarter.report_data.map(r => r["Coupon Code"])).size)
    const [grossRevenueTotal, setGrossRevenueTotal] = useState("")
    useEffect(() => {
        let t = 0
        quarter.report_data.forEach((r) => {
            t += financialToNumeric(r["Gross Revenue"])
        })
        setGrossRevenueTotal(numberToFinancial(t.toFixed(2)))
    }, [])

    // Editor controls
    const [editorOpen, setEditorOpen] = useState(false)
    const quarterRef = useRef<HTMLDivElement | null>(null)
    const editorRef = useRef<HTMLDivElement | null>(null)
    useControlOpen({
        parentRef: quarterRef,
        childRef: editorRef,
        state: editorOpen,
        setState: setEditorOpen
    })

    return (
        <>
            <div className="flex flex-col means-border-bottom wrap-anywhere" ref={quarterRef}>
                {/* Year and Quarter */}
                <div className="flex flex-row justify-between text-white text-lg md:text-xl pt-1 md:pt-2 px-1 md:px-2">
                    <div>{quarter.year}Q{quarter.quarter}</div>
                    <div>{editorOpen? "▽" : "▷"}</div>
                </div>
                {/* Quick Info */}
                <div className="flex flex-row gap-2 p-1 md:p-2 text-means-grey text-xs md:text-sm">
                    <div>Num. Coupon Codes: <div className="text-means-red-hover">{numberOfCodes}</div></div>
                    <div>Total Gross Revenue: <div className="text-means-red-hover">{grossRevenueTotal}</div></div>
                </div>
            </div>
            <ReportEditor hidden={!editorOpen} ref={editorRef} quarterInitial={quarter}/>
        </>
    )
}

function Controls({
    currentPage,
    pageSetter,
    numPages
}: {
    currentPage: number,
    pageSetter: Dispatch<SetStateAction<number>>,
    numPages: number
}) {
    let next2, next, prev, prev2

    // Other choices to render dynamically
    const [to1, setTo1] = useState(false)
    const [toMax, setToMax] = useState(false)
    const [controlArr, setControlArray] = useState(new Array<number | null>)

    // Set values
    useEffect(() => {
        if (currentPage > numPages) pageSetter(numPages)

        setToMax(currentPage + 3 >= numPages ? false : true)
        next2 = currentPage + 1 >= numPages ? null : currentPage + 2
        next = currentPage >= numPages ? null : currentPage + 1
        prev = currentPage <= 1 ? null : currentPage - 1
        prev2 = currentPage - 1 <= 1 ? null : currentPage - 2
        setTo1(currentPage - 3 <= 1? false : true)

        setControlArray([prev2, prev, currentPage, next, next2])
    }, [currentPage, numPages])
    function renderIfNotNull(bool:boolean, component: ReactNode) {if (bool) return component}
    return (
        <div className="flex flex-row justify-between gap-1 m-1 md:m-2 means-border-top rounded-b-1 text-xs md:text-sm text-means-grey ">
            {/* Back One */}
            <div className="hover:text-means-grey-hover cursor-pointer" onClick={() => {pageSetter(Math.max(0, currentPage - 1))}}>◁</div>
            {/* Go to Start */}
            {renderIfNotNull(
                to1,
                (<><div className="hover:text-means-grey-hover cursor-pointer" onClick={() => {pageSetter(1)}}>1
                </div><div>...</div></>)
            )}
            {/* Pages Before and Afer */}
            {controlArr.map((num, i) => {
                if (!num) return null
                return (
                    <div
                        className={clsx("hover:text-means-grey-hover cursor-pointer", {"text-means-red": num === currentPage})}
                        onClick={() => {pageSetter(num)}}
                        key={i}>
                        {num}
                    </div>
                )
            })}
            {/* Go to End */}
            {renderIfNotNull(
                toMax,
                (<><div>...</div><div className="hover:text-means-grey-hover cursor-pointer" onClick={() => {pageSetter(numPages)}}>{numPages}
                </div></>)
            )}
            {/* Forward One */}
            <div className="hover:text-means-grey-hover cursor-pointer" onClick={() => {pageSetter(Math.min(numPages, currentPage + 1))}}>▷</div>
        </div>
    )
}

// A context allows the editable fields to edit the quarter without passing it all the way down
// Equivalent to declaring a function
const QuarterContext = createContext<{changeQuarter: Dispatch<SetStateAction<QuarterlyReport>>}
    | null>(null)

function ReportEditor({ quarterInitial, hidden, ref }: { quarterInitial: QuarterlyReport, hidden: boolean, ref: RefObject<HTMLDivElement | null> }) {
    // Quarter editing controls
    const [quarter, changeQuarter] = useState(structuredClone(quarterInitial))

    // Form controls
    const [filter, setFilter] = useState("")

    // Pagination controls
    const REPORTSPERPAGE = 5
    const [pageNumber, setPageNumber] = useState(1)
    const [numPages, setNumPages] = useState(Math.ceil(quarter.report_data.length / REPORTSPERPAGE))
    useEffect(() => {
        setNumPages(
            Math.ceil(
                quarter.report_data
                    .filter(r => r["Coupon Code"].toLowerCase()
                    .includes(filter.toLowerCase()))
                    .length / REPORTSPERPAGE)
        )
    }, [REPORTSPERPAGE, filter])

    // Save report
    const [error, setError] = useState<string | null>(null)
    const [_, action, pending] = useActionState(
        async () => {
            const response = await fetch('api/analytics/update-quarterly-report', {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(quarter)
            })

            // Handle an error; display to user
            if (response.status !== 200) {
                setError(response.statusText)
                return
            }

            // Reset error
            setError(null)
        },
        null
    )

    return (
        <div
            ref={ref}
            className={clsx("means-border w-full h-fit md:w-fit md:h-fit ml-0 mt-1 md:ml-2 md:mt-0 top-full md:left-full md:top-0 bg-black z-50",
            {"hidden": hidden, "absolute": !hidden}
        )}>
            <QuarterContext value={{ changeQuarter }}>
            <div className="flex flex-col">

                {/* Form Controls */}
                <div className="flex flex-col text-xs md:text-sm p-1 md:p-2 gap-1 md:gap-2 means-border-bottom cursor-auto">
                    <div className="flex flex-row gap-1 md:gap-2">
                        {pending? <Spinner />: <></>}
                        <Check show={pending !== null && !pending}/>
                        <div onClick={() => startTransition(action)} className="means-border p-0.5 md:p-1 cursor-pointer hover:bg-means-bg-hover">Save Changes</div>
                        <div onClick={() => {changeQuarter(structuredClone(quarterInitial))}} className="means-border p-0.5 md:p-1 cursor-pointer hover:bg-means-bg-hover">Reset Changes</div>
                        <input className="means-input px-0" placeholder="Filter by coupon code..." value={filter} onChange={(e) => setFilter(e.target.value)} />
                    </div>
                    <Error text={error? error : ''} hidden={error? false : true} />
                </div>

                {/* Reports By Coupon Code */}
                <div className="flex flex-col">
                    {quarter.report_data
                        .filter(r => r["Coupon Code"].toLowerCase()
                        .includes(filter.toLowerCase()))
                        .map((q, i) => {
                            return (
                                <Report reportDataRow={q} key={i}/>
                            )
                        })
                        .slice((pageNumber - 1) * REPORTSPERPAGE, pageNumber * REPORTSPERPAGE)
                    }
                </div>

                {/* Controls */}
                <Controls currentPage={pageNumber} pageSetter={setPageNumber} numPages={numPages} />
            </div>
            </QuarterContext>
        </div>
    )
}

function Report({ reportDataRow }: { reportDataRow: ReportDataRowUncast }) {
    // Properties editor controls
    const reportRef = useRef(null)
    const propertiesRef = useRef(null)
    const [editorOpen, setEditorOpen] = useState(false)
    useControlOpen({
        parentRef: reportRef,
        childRef: propertiesRef,
        state: editorOpen,
        setState: setEditorOpen
    })
    return (
        <div className="flex flex-col means-border-bottom relative hover:bg-means-bg-hover" ref={reportRef}>
            <div className="flex flex-row justify-between text-white text-base md:text-lg pt-0.5 md:pt-1 px-0.5 md:px-1">
                <div>{reportDataRow["Coupon Code"]}</div>
                <div>{editorOpen? "▽" : "▷"}</div>
            </div>
            <div className="flex flex-row gap-2 p-0.5 md:p-1 text-means-grey text-xs">
                <div>Creator Payout:<div className="text-means-red-hover">{reportDataRow["1/3 of Total"]}</div></div>
                <div>Subscribers:<div className="text-means-red-hover">{reportDataRow["Number of Subscribers"]}</div></div>
            </div>
            <EditableReportProperties reportDataRow={reportDataRow} hidden={!editorOpen} ref={propertiesRef} />
        </div>
    )
}

function EditableReportProperties({ reportDataRow, hidden, ref }: { reportDataRow: ReportDataRowUncast, hidden: boolean, ref: RefObject<HTMLDivElement | null> }) {
    return (
        <div
            ref={ref}
            className={clsx("means-border w-full h-fit md:w-fit md:h-fit ml-0 mt-1 md:ml-2 md:mt-0 top-full md:left-full md:top-0 bg-black z-50",
            {"hidden": hidden, "absolute": !hidden}
        )}>
            {AnalyticsPropertiesAsArray.map((property, i) => {
                return (
                    <EditableReportDatapoint
                        property={property as AnalyticsProperties}
                        propertyValue={reportDataRow[property as AnalyticsProperties]}
                        couponCode={reportDataRow["Coupon Code"]}
                        key={i}
                    />
                )
            })}
        </div>
    )
}

function EditableReportDatapoint({ property, propertyValue, couponCode }: { property: AnalyticsProperties, propertyValue: string | number, couponCode: string }) {
    // Get the context
    const context = useContext(QuarterContext)
    if (!context) return (
        <Error text={"Could not find context"} hidden={false} />
    )
    const { changeQuarter } = context
    return (
        <div className="flex flex-row justify-between p-0.5 gap-2 text-xs md:text-2xs text-nowrap means-border-bottom cursor-auto">
            <div>{property}</div>
            <input
                type={isNumericPropertyUncast(property)? "number": "text"}
                className="means-input"
                value={propertyValue}
                onChange={(e) => {changeQuarter(quarter => {
                    let newQuarter = {...quarter}
                    if (isNumericPropertyUncast(property)) {
                        (newQuarter.report_data.filter(r => r["Coupon Code"] === couponCode)[0][property] as ReportDataRowUncast['Number of Subscribers']) = Number(e.target.value)
                    } else {
                        (newQuarter.report_data.filter(r => r["Coupon Code"] === couponCode)[0][property] as Exclude<ReportDataRowUncast[AnalyticsProperties], number>) = e.target.value
                    }
                    return newQuarter
                })}}
            />
        </div>
    )
}
