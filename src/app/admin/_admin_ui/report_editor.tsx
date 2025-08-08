import Controls from "@/app/_client_ui/pagination_controls"
import { QuarterlyReport } from "@/lib/database/schemas"
import clsx from "clsx"
import { Dispatch, SetStateAction, RefObject, useState, useEffect, useActionState, startTransition, createContext } from "react"
import * as l from "lodash";
import { ReportDataRow } from "./report_data_row"
import EditorControls from "./editor_controls"

// A context allows the editable fields to edit the quarter without passing it all the way down
// Equivalent to declaring a function
export const QuarterSetter = createContext<{changeQuarter: Dispatch<SetStateAction<QuarterlyReport>>}| null>(null)
export const Quarters = createContext<{initial: QuarterlyReport, current: QuarterlyReport} | null>(null)

export function ReportEditor({
    quarterInitialProps,
    hidden,
    ref,
    noPost=false,
    persistState=null
}: {
    quarterInitialProps: QuarterlyReport,
    hidden: boolean,
    ref: RefObject<HTMLDivElement | null>,
    noPost?: boolean
    persistState?:Dispatch<SetStateAction<QuarterlyReport>> | null
}) {
    // Quarter editing controls
    const [quarterInitial, setQuarterInitial] = useState(structuredClone(quarterInitialProps))
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

            // Reset quarterInitial and quarter
            setQuarterInitial(quarter)
            changeQuarter(structuredClone(quarter))

            // Reset error
            setError(null)
        },
        null
    )

    // Check for differences and persist changes if told to do so
    const [unsavedChanges, setUnsavedChanges] = useState(false)
    useEffect(() => {
        setUnsavedChanges(!l.isEqual(quarter, quarterInitial))
        if (persistState) {persistState(quarter)}
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
                    <EditorControls
                        noSave={noPost}
                        savePending={pending}
                        unsavedChanges={unsavedChanges}
                        onSave={() => startTransition(action)}
                        onResetChanges={() => {changeQuarter(structuredClone(quarterInitial))}}
                        filter={filter}
                        filterPlaceholder="Filter by coupon code..."
                        setFilter={setFilter}
                        error={error}
                    />

                    {/* Reports By Coupon Code */}
                    <div className="flex flex-col">
                        {quarter.report_data
                            .filter(r => r["Coupon Code"].toLowerCase()
                            .includes(filter.toLowerCase()))
                            .map((q, i) => {
                                return (
                                    <ReportDataRow reportDataRow={q} key={i}/>
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
