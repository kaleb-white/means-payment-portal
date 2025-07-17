import { Dispatch, SetStateAction, useState } from "react"
import clsx from "clsx";

import { AnalyticsProperties, AnalyticsPropertiesAsArray } from "../_interfaces/types"


export default function Controls({
    setGraphProperty,
    setQuartersPrevious,
    graphProperty,
    quartersPrevious
}: {
    setGraphProperty: Dispatch<SetStateAction<AnalyticsProperties>>,
    setQuartersPrevious: Dispatch<SetStateAction<number>>,
    graphProperty: AnalyticsProperties,
    quartersPrevious: number
}) {
    const [menuShowing, setShowing] = useState(false)

    return (
        <div className="flex flex-col mt-2 gap-2 text-xs md:text-lg">
            <div className="flex flex-row gap-5">

                {/* Graph property controls */}
                <div className="text-means-red">PROPERTY</div>
                <div role="menu" className="text-white max-w-32 md:max-w-none min-w-32 md:min-w-none cursor-pointer" onClick={_ => setShowing(!menuShowing)}>
                    {graphProperty} {menuShowing? "▽" : "▷"}
                    <div className={clsx(
                        "transition-all duration-300 ease-out",
                        "text-white text-2xs md:text-sm absolute means-border bg-black flex flex-col gap-0.5",
                        {
                            "scale-95 opacity-0": !menuShowing,
                            "scale-100 opacity-100": menuShowing
                        })}
                    >
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
            <div className="flex flex-row gap-5">
                <div className="text-means-red">QUARTERS</div>
                <div></div>
            </div>
        </div>
    )
}
