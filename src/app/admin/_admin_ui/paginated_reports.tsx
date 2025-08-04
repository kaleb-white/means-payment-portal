'use client'

import { AnalyticsProperties, AnalyticsPropertiesAsArray, isNumericPropertyUncast } from "@/app/_client_interfaces/types";
import Error from "@/app/_client_ui/error";
import { Check, Spinner } from "@/app/_client_ui/spinner";
import useControlOpen from "@/app/_custom_hooks/use_control_open";
import { financialToNumeric, numberToFinancial } from "@/format_converter";
import { QuarterlyReport, Range, ReportDataRowUncast } from "@/lib/database/schemas";
import clsx from "clsx";
import { createContext, Dispatch, RefObject, SetStateAction, startTransition, use, useActionState, useContext, useEffect, useRef, useState } from "react";
import * as l from "lodash";
import Controls from "@/app/_client_ui/pagination_controls";


// Helpers
function filterReportByCouponCode(quarter: QuarterlyReport, couponCode: string): ReportDataRowUncast {
    return quarter.report_data.filter(r => r["Coupon Code"] === couponCode)[0]
}

export default function PaginatedReports ({
    initialReports,
    numReports,
    REPORTSPERPAGE=1
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


// A context allows the editable fields to edit the quarter without passing it all the way down
// Equivalent to declaring a function
const QuarterSetter = createContext<{changeQuarter: Dispatch<SetStateAction<QuarterlyReport>>}| null>(null)
const Quarters = createContext<{initial: QuarterlyReport, current: QuarterlyReport} | null>(null)

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

    // Check for differences
    const [unsavedChanges, setUnsavedChanges] = useState(false)
    useEffect(() => {
        setUnsavedChanges(!l.isEqual(quarter, quarterInitial))
    }, [quarter, quarterInitial])

    return (
        <div
            ref={ref}
            className={clsx("means-border w-full h-fit md:w-fit md:h-fit ml-0 mt-1 md:ml-2 md:mt-0 top-full md:left-full md:top-0 bg-black z-50",
            {"hidden": hidden, "absolute": !hidden}
        )}>
            <QuarterSetter value={{ changeQuarter }}>
            <Quarters value={{ initial: quarterInitial, current: quarter }}>
                <div className="flex flex-col">

                    {/* Form Controls */}
                    <div className="flex flex-col text-xs md:text-sm p-1 md:p-2 gap-1 md:gap-2 means-border-bottom cursor-auto">
                        <div className="flex flex-row gap-1 md:gap-2">
                            {pending? <Spinner />: <></>}
                            <Check show={pending !== null && !pending}/>
                            <div onClick={() => startTransition(action)} className={clsx("p-0.5 md:p-1 cursor-pointer", {'means-border hover:bg-means-bg-hover': !unsavedChanges, "bg-means-red hover:bg-means-red-hover": unsavedChanges})}>Save Changes</div>
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
            </Quarters>
            </QuarterSetter>
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

    // Check for unsaved changes
    const reports = useContext(Quarters)
    const [unsavedChanges, setUnsavedChanges] = useState(false)
    useEffect(() => {
        if (!reports) return
        const initial = filterReportByCouponCode(reports.initial, reportDataRow["Coupon Code"])
        const curr = filterReportByCouponCode(reports.current, reportDataRow["Coupon Code"])
        setUnsavedChanges(!l.isEqual(initial, curr))
    }, [reports])

    return (
        <div className="flex flex-col means-border-bottom relative hover:bg-means-bg-hover" ref={reportRef}>
            <div className="flex flex-row justify-between text-white text-base md:text-lg pt-0.5 md:pt-1 px-0.5 md:px-1">
                <div>{reportDataRow["Coupon Code"]} {unsavedChanges? <div className="text-means-red text-xs inline-block">(unsaved changes)</div>: <></>}</div>
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
    const context = useContext(QuarterSetter)
    if (!context) return (
        <Error text={"Could not find context"} hidden={false} />
    )
    const { changeQuarter } = context

    // Check for unsaved changes
    const [unsavedChanges, setUnsavedChanges] = useState(false)
    const reports = useContext(Quarters)
    useEffect(() => {
        if (!reports) return
        const initial = filterReportByCouponCode(reports.initial, couponCode)[property]
        const curr = filterReportByCouponCode(reports.current, couponCode)[property]
        setUnsavedChanges(initial !== curr)
    }, [reports])

    return (
        <div className={clsx("flex flex-row justify-between p-0.5 gap-2 text-xs md:text-2xs text-nowrap cursor-auto",
            {'means-border-bottom-red': unsavedChanges, 'means-border-bottom': !unsavedChanges}
        )}>
            <div>
                {property} {unsavedChanges?
                    <div className="inline-block text-2xs text-means-red">orig: {reports? filterReportByCouponCode(reports.initial, couponCode)[property]: ""}</div>
                    : <></>
                }
            </div>
            <input
                type={isNumericPropertyUncast(property)? "number": "text"}
                className="means-input"
                value={propertyValue}
                onChange={(e) => {changeQuarter(quarter => {
                    let newQuarter = {...quarter}
                    if (isNumericPropertyUncast(property)) {
                        (filterReportByCouponCode(newQuarter, couponCode)[property] as ReportDataRowUncast['Number of Subscribers']) = Number(e.target.value)
                    } else {
                        (filterReportByCouponCode(newQuarter, couponCode)[property] as Exclude<ReportDataRowUncast[AnalyticsProperties], number>) = e.target.value
                    }
                    return newQuarter
                })}}
            />
        </div>
    )
}
