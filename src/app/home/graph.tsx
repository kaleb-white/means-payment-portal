'use client'

import { ReportDataRow } from "@/lib/services/database/interfaces"
import { AnalyticsProperties } from "../_interfaces/types"

import * as d3 from "d3"
import { useEffect, useRef, useState } from "react"
import { numberToFinancial } from "../_client_ui/format_converter"



// Reference:   https://2019.wattenberger.com/blog/react-and-d3
//              https://observablehq.com/@d3/d3-scaletime
//              https://observablehq.com/@d3/bar-chart/2

export default function Graph({
    reportData, property, width, height
}: {
    reportData: ReportDataRow[], property: AnalyticsProperties, width: number, height: number
}) {
    const ref = useRef(null)

    const ran = useRef(false) // stop double rendering in react strict mode

    useEffect(() => {
        if (ran.current) return
        if (!ran.current) ran.current = true

        if (!ref.current) return

        const margin = { top: 10, right: 10, bottom: 15, left: 40 };
        const innerWidth = width - margin.left - margin.right
        const innerHeight = height - margin.top - margin.bottom

        const rectPadding = 5
        const textPadding = 5

        // x scale
        const x = d3.scaleBand()
            .domain(reportData.map(report => report.Period))
            .range([0, innerWidth])
            .padding(0.1)

        // y scale
        const maxValue = d3.max(reportData, (r) => r[property]) || 0
        const y = d3.scaleLinear()
            .domain([0, maxValue])
            .range([innerHeight, rectPadding])

        // Create svg container
        const svg = d3.select(ref.current)
            .attr("width", width)
            .attr("height", height)
            .attr("viewBox", [0, 0, width, height])

        // Add a rect for each bar
        svg.selectAll("rect.bar")
        .data(reportData)
        .join(
            enter => {
                // Main rect
                /*
                D3 only runs join once, so there's no saving local variables
                So here they are in a readable format (where d is current datapoint)
                - rectX = (x(d.Period)  ?? 0) + margin.left
                - rectY = y(d[property]) - rectPadding
                - width = x.bandwidth()
                - height = innerHeight - y(d[property])

                - textX = textRectX + textPadding
                - textY = textRectY + (does this bar reach the top of the svg? + 2 * textPadding : -textPadding)
                */
                // rect
                const bar = enter.append("rect")
                    .attr("class", "bar fill-red-500 hover:fill-red-400")
                    .attr("x", d => (x(d.Period) ?? 0) + margin.left)
                    .attr("y", d => y(d[property]) - rectPadding)
                    .attr("width", x.bandwidth())
                    .attr("height", d => innerHeight - y(d[property]))
                    .attr("rx", "8")

                // text
                enter.append("text")
                    .text(d => numberToFinancial(String(d[property])))
                    .attr("class", "graph-text")
                    .attr("x", d => (
                        (x(d.Period) ?? 0) + margin.left) + rectPadding
                        + textPadding
                    )
                    .attr("y",
                        d => y(d[property]) - rectPadding +
                        (y(d[property]) - rectPadding <= 0? 2 * textPadding : (-textPadding))
                    )
                return bar
            },
            update => update,
            exit => exit.remove()
        );


        // Add the x-axis and label
        svg.append("g")
            .attr("transform", `translate(${margin.left}, ${innerHeight})`)
            .call(d3.axisBottom(x))
            .selectAll("text")
                .attr("font-size", 15)
                .attr("class", "graph-text-white")

        // Add the y-axis and label
        svg.append("g")
            .attr("transform", `translate(${margin.left}, 0)`)
            .call(d3.axisLeft(y))
            .attr("class", "graph-text-white")

    }, [width, height, reportData, property])

    return (
        <>
            <svg
                ref={ref}
            />
        </>
    )
}
