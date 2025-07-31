'use client'

import Error from "@/app/_client_ui/error";
import { financialToNumeric, numberToFinancial } from "@/format_converter";
import { QuarterlyReport } from "@/lib/database/schemas";
import { use, useEffect, useState } from "react";

export default function PaginatedReports ({
    initialReports,
    numReports
}: {
    initialReports: Promise<QuarterlyReport[] | Error>,
    numReports: Promise<number | Error>
}) {
    // Reports
    let reports = use(initialReports)
    let reportsLength = use(numReports)

    // Pagination controls
    const REPORTSPERPAGE = 5
    const [pageNumber, setPageNumber] = useState(1)

    if (reports instanceof Error) {
        return (
            <div className="flex flex-col means-border">
                <Error text={(reports as Error).message} hidden={false} />
            </div>
        )
    }
    return (
        <div className="flex flex-col means-border w-fit">
            <div className="flex flex-col">{
                (reports as QuarterlyReport[])
                    .slice((pageNumber - 1) * REPORTSPERPAGE, pageNumber * REPORTSPERPAGE)
                    .map((r, i) => <Quarter key={i} quarter={r}/>)
            }</div>
        </div>
    )

}

function Quarter ({
    quarter
}: {
    quarter: QuarterlyReport
}) {
    // Data to display
    const [numberOfCodes, setNumberOfCode] = useState(new Set(quarter.report_data.map(r => r["Coupon Code"])).size)
    const [grossRevenueTotal, setGrossRevenueTotal] = useState("")
    useEffect(() => {
        let t = 0
        quarter.report_data.forEach((r) => {
            t += financialToNumeric(r["Gross Revenue"])
        })
        setGrossRevenueTotal(numberToFinancial(t.toFixed(2)))
    }, [])
    return (
        <div className="flex flex-col means-border-bottom wrap-anywhere">
            <div className="flex flex-row justify-between text-white text-lg md:text-xl pt-1 md:pt-2 px-1 md:px-2">
                <div>{quarter.year}Q{quarter.quarter}</div>
                <div>▷</div>
            </div>
            <div className="flex flex-row gap-1 p-1 md:p-2 text-means-grey text-xs md:text-sm">
                <div>Num. Coupon Codes: <div className="text-means-red-hover">{numberOfCodes}</div></div>
                <div>Total Gross Revenue: <div className="text-means-red-hover">{grossRevenueTotal}</div></div>
            </div>
        </div>
    )
}

function Controls() {

}
