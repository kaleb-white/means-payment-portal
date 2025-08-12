import useControlOpen from "@/app/_custom_hooks/use_control_open"
import { QuarterlyReport, ReportDataRowUncast } from "@/lib/database/schemas"
import { useRef, useState, useContext, useEffect } from "react"
import { EditableReportProperties } from "./editable_report_properties"
import * as l from 'lodash'
import { Quarters } from "./report_editor"

// Helpers
function filterReportByCouponCode(quarter: QuarterlyReport, couponCode: string): ReportDataRowUncast {
    return quarter.report_data.filter(r => r["Coupon Code"] === couponCode)[0]
}

export function ReportDataRow({ reportDataRow }: { reportDataRow: ReportDataRowUncast }) {
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
                <div>{reportDataRow["Coupon Code"]} {unsavedChanges? <div className="text-means-red text-xs inline-block">(edited)</div>: <></>}</div>
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
