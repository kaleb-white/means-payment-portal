'use client'
import { Dispatch, SetStateAction, useEffect, useState } from "react"
import clsx from "clsx";

import { AnalyticsProperties, AnalyticsPropertiesAsArray } from "../_interfaces/types"
import { ReportDataRow } from "@/lib/services/database/interfaces";
import { numberToFinancial } from "@/format_converter";


export default function Controls({
    reportData,
    setGraphProperty,
    setQuartersPrevious,
    graphProperty,
    quartersPrevious,
    changePending
}: {
    reportData: ReportDataRow[],
    setGraphProperty: Dispatch<SetStateAction<AnalyticsProperties>>,
    setQuartersPrevious: Dispatch<SetStateAction<number>>,
    graphProperty: AnalyticsProperties,
    quartersPrevious: number,
    changePending: boolean
}) {
    const [menuShowing, setShowing] = useState(false)

    const [sum, setSum] = useState("")
    const [yearSum, setYearSum] = useState("")

    useEffect(() => {
        // Get year
        const currentYear = new Date().getFullYear()

        // Initialize sum and yearSum
        let sum = 0
        let yearSum = 0

        // Rounding update function
        const ru = (curr:number, add:number) => Number((curr + add).toFixed(2))

        // Perform sum
        reportData.forEach(e => {
            sum = ru(sum, e[graphProperty])
            if (e.Period.slice(0, 4) === String(currentYear)) yearSum = ru(yearSum, e[graphProperty])
        })

        // Set values
        setSum(graphProperty === 'Number of Subscribers'? String(sum) : numberToFinancial(String(sum)))
        setYearSum(graphProperty === 'Number of Subscribers'? String(yearSum) : numberToFinancial(String(yearSum)))
    }, [reportData, graphProperty])

    return (
        <div className="mt-2 text-xs md:text-lg flex gap-2 flex-col md:flex-row justify-between">

            {/* Graph property and quarter controls */}
            <div className="flex flex-col gap-2">
                <div className="flex flex-row gap-5">

                    {/* Graph property controls */}
                    <div className="text-means-red">PROPERTY</div>
                    <div role="menu" className="text-white max-w-32 md:max-w-none min-w-32 md:min-w-none cursor-pointer" onClick={_ => setShowing(!menuShowing)}>
                        {graphProperty} {menuShowing? "▽" : "▷"}
                        <div className={clsx(
                            "transition-all duration-300 ease-in", // TODO: fix
                            "text-white text-2xs md:text-sm absolute means-border bg-black flex flex-col gap-0.5",
                            {
                                "scale-95 opacity-0 hidden": !menuShowing,
                                "scale-100 opacity-100": menuShowing
                            })}
                        >
                        {/* Graph property options */}
                        {AnalyticsPropertiesAsArray.map((possibleProperty, i) => {return (
                            <div
                                key={i}
                                onClick={_ => setGraphProperty(possibleProperty as AnalyticsProperties)}
                                className={clsx("mx-1 cursor-pointer", {"hidden": possibleProperty === graphProperty})}
                            >
                                {possibleProperty}
                            </div>
                        )})}
                        </div>
                    </div>
                </div>

                {/* Number of quarters to display controls */}
                <div className="flex flex-row gap-5 text-white">
                    <div className="text-means-red">QUARTERS</div>
                    <div className="flex flex-row gap-3">
                        {/* + */}
                        <div className="means-border px-1" onClick={_ => setQuartersPrevious(quartersPrevious - 1)}>－</div>
                        {/* Numerical input box */}
                        <input
                            onChange={e => setQuartersPrevious(Number(e.target.value))}
                            className="means-border bg-means-grey w-8 text-center text-black"
                            value={quartersPrevious}
                        />
                        {/* - */}
                        <div className="means-border px-1" onClick={_ => setQuartersPrevious(quartersPrevious + 1)}>＋</div>
                    </div>
                    {changePending? <div className="flex items-center"><div className="animate-spin border-means-red size-5 rounded-full border-4 border-t-transparent"></div></div> : <></>}
                </div>
            </div>

            {/* Data totals */}
            <div className="flex flex-col gap-2">
                {/* Sum */}
                <div className="flex flex-row-reverse gap-5">
                    <div className="text-white">{sum}</div>
                    <div className="text-means-red">SUM OVER PERIOD</div>
                </div>
                {/* Current year */}
                <div className="flex flex-row-reverse gap-5">
                    <div className="text-white">{yearSum}</div>
                    <div className="text-means-red">CURRENT YEAR</div>
                </div>
            </div>
        </div>
    )
}
