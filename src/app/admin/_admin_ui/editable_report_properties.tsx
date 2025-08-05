import { AnalyticsPropertiesAsArray, AnalyticsProperties, isNumericPropertyUncast } from "@/app/_client_interfaces/types"
import { isValidFinancial } from "@/format_converter"
import { QuarterlyReport, ReportDataRowUncast } from "@/lib/database/schemas"
import clsx from "clsx"
import { FocusEvent, RefObject, useContext, useState, useEffect, ChangeEvent } from "react"
import Error from "@/app/_client_ui/error"
import { Quarters, QuarterSetter } from "./report_editor"

// Helpers
function filterReportByCouponCode(quarter: QuarterlyReport, couponCode: string): ReportDataRowUncast {
    return quarter.report_data.filter(r => r["Coupon Code"] === couponCode)[0]
}

export function EditableReportProperties({ reportDataRow, hidden, ref }: { reportDataRow: ReportDataRowUncast, hidden: boolean, ref: RefObject<HTMLDivElement | null> }) {
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

    // Financial field input valid check
    const [validFinancial, setIsValidFinancial] = useState(true)

    // Check for unsaved changes
    const [unsavedChanges, setUnsavedChanges] = useState(false)
    const reports = useContext(Quarters)
    useEffect(() => {
        if (!reports) return
        const initial = filterReportByCouponCode(reports.initial, couponCode)[property]
        const curr = filterReportByCouponCode(reports.current, couponCode)[property]
        setUnsavedChanges(initial !== curr)
    }, [reports])

    // OnChange function
    function editQuarterOnChange(e: ChangeEvent<HTMLInputElement>) {
        changeQuarter(quarter => {
            // Create mutable object copy
            let newQuarter = {...quarter}

            // Check if field is numeric or financial
            if (isNumericPropertyUncast(property)) {
                (filterReportByCouponCode(newQuarter, couponCode)[property] as ReportDataRowUncast['Number of Subscribers']) = Number(e.target.value)
            }
            // If not numeric
            else {
                (filterReportByCouponCode(newQuarter, couponCode)[property] as Exclude<ReportDataRowUncast[AnalyticsProperties], number>) = e.target.value
            }
            return newQuarter
        })
    }

    // OnBlur function
    function checkFinancialOnBlur(e: FocusEvent<HTMLInputElement, Element>) {
        // Ignore numerics
        if (isNumericPropertyUncast(property)) return
        // Use function from format coverter to test
        if (isValidFinancial(e.target.value)) {setIsValidFinancial(true); return}
        setIsValidFinancial(false)
        changeQuarter(quarter => {
            // Create mutable object copy
            let newQuarter = {...quarter};
            if (!reports?.initial) return quarter;
            const oldVal = filterReportByCouponCode(reports.initial, couponCode)[property];
            (filterReportByCouponCode(newQuarter, couponCode)[property] as Exclude<ReportDataRowUncast[AnalyticsProperties], number>) = oldVal as string
            return newQuarter
        })
    }

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
                className={clsx("means-input", {'means-border-red': !validFinancial})}
                value={propertyValue}
                onChange={(e) => editQuarterOnChange(e)}
                onBlur={(e) => checkFinancialOnBlur(e)}
            />
        </div>
    )
}
