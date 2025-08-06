import useControlOpen from "@/app/_custom_hooks/use_control_open"
import { financialToNumeric, numberToFinancial } from "@/format_converter"
import { QuarterlyReport } from "@/lib/database/schemas"
import { useState, useEffect, useRef, SetStateAction, Dispatch } from "react"
import { ReportEditor } from "./report_editor"

export function Quarter ({
    quarter,
    noPost=false,
    persistState=null
}: {
    quarter: QuarterlyReport,
    noPost?: boolean,
    persistState?: Dispatch<SetStateAction<QuarterlyReport>> | null
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
                <div className="flex flex-row justify-between text-white text-lg md:text-xl pt-1 px-1 md:px-2">
                    <div>{quarter.year}Q{quarter.quarter}</div>
                    <div>{editorOpen? "▽" : "▷"}</div>
                </div>
                {/* Quick Info */}
                <div className="flex flex-row gap-2 p-1 md:px-2 text-means-grey text-xs md:text-sm">
                    <div>Num. Coupon Codes: <div className="text-means-red-hover">{numberOfCodes}</div></div>
                    <div>Total Gross Revenue: <div className="text-means-red-hover">{grossRevenueTotal}</div></div>
                </div>
            </div>
            <ReportEditor hidden={!editorOpen} ref={editorRef} quarterInitialProps={quarter} noPost={noPost} persistState={persistState}/>
        </>
    )
}
