'use client'

import { ReportDataRow } from "@/lib/services/database/interfaces"
import { AnalyticsProperties } from "../_interfaces/types"

import * as d3 from "d3"
import { useEffect, useRef} from "react"
import { numberToFinancial, quarterToDate } from "../../format_converter"

// Some d3 references:  https://2019.wattenberger.com/blog/react-and-d3
//                      https://observablehq.com/@d3/d3-scaletime
//                      https://observablehq.com/@d3/bar-chart/2

export default function Graph({
    reportDataUnsorted, property, maxWidth, height
}: {
    reportDataUnsorted: ReportDataRow[], property: AnalyticsProperties, maxWidth: number, height: number
}) {
    const ref = useRef(null)

    useEffect(() => {
        if (!ref.current) return

        // Set width as min of screen with padding or maxWidth
        const windowScreenWidth = window.screen.availWidth - 100
        const width = min(maxWidth, windowScreenWidth)

        // Constants
        const margin = { top: 10, right: 10, bottom: 15, left: 40 };
        const innerWidth = width - margin.left - margin.right
        const innerHeight = height - margin.top - margin.bottom

        const rectPadding = 5
        const textPaddingX = windowScreenWidth < 1000? -2 : 5
        const textPaddingY = windowScreenWidth < 1000? 5 : 7

        // Sort data
        const reportData = reportDataUnsorted.sort((a, b) => quarterToDate(a.Period) < quarterToDate(b.Period)? -1: 1)

        // x scale
        const x = d3.scaleBand()
            .domain(reportData.map(report => report.Period))
            .range([0, innerWidth])
            .padding(0.1)

        // y scale
        const maxValue = () => d3.max(reportData, (r) => r[property]) || 0
        const y = d3.scaleLinear()
            .domain([0, maxValue()])
            .range([innerHeight, rectPadding])

        // Create svg container
        const svg = d3.select(ref.current)
            .attr("width", width)
            .attr("height", height)
            .attr("viewBox", [0, 0, width, height])

        // Remove all bars and text before rerendering
        svg.selectAll('rect, .graph-text').remove()


        // Add data-dependent svg elements
        svg.selectAll("rect.bar")
        .data(reportData)
        .join(
            enter => {
                // Main rect
                /*
                D3 only runs join once, so there's no saving local variables
                So here they are in a readable format (where d is current datapoint)
                - rectX = (x(d.Period)  ?? 0) + margin.left
                - rectY = y(d[property]) - rectPadding, starts at rectY + height for transition purposes
                - width = x.bandwidth()
                - height = innerHeight - y(d[property]), starts at 0 for transition purposes

                - textX = textRectX + textPadding
                - textY = textRectY + (does this bar reach the top of the svg? + 2 * textPadding : -textPadding)
                */
                // rect
                const bar = enter.append("rect")
                    .attr("class", "bar fill-red-500 hover:fill-red-400")
                    .attr("x", d => (x(d.Period) ?? 0) + margin.left)
                    .attr("y", innerHeight - rectPadding)
                    .attr("width", x.bandwidth())
                    .attr("height", 0)
                    .attr("rx", "8")

                // text
                enter.append("text")
                    .attr("class", "graph-text")
                    .attr("x", d => (
                        (x(d.Period) ?? 0) + margin.left) + rectPadding
                        + textPaddingX
                    )
                    .attr("y",
                        d => y(d[property]) - rectPadding +
                        (y(d[property]) - rectPadding <= 0? 2 * textPaddingY : (-textPaddingY))
                    )

                return bar
            },
            update => update,
            exit => exit.remove()
        );

        // Rect transition
        svg.selectAll('rect').transition()
            .attr('height', d => innerHeight - y((d as ReportDataRow)[property]))
            .attr('y', d => y((d as ReportDataRow)[property]) - rectPadding)
            .duration(750)

        // Text transition
        svg.selectAll('.graph-text').transition()
            .text(d => {
                return (property as string) === 'Number of Subscribers'?
                String((d as ReportDataRow)[property]) :
                numberToFinancial(String((d as ReportDataRow)[property]))}
            )
            .attr("y",
                d => y((d as ReportDataRow)[property]) - rectPadding +
                (y((d as ReportDataRow)[property]) - rectPadding <= 0? 2 * textPaddingY : (-textPaddingY))
            )

        // Remove old axes
        svg.selectAll('.x-axis, .y-axis, .axis-group').remove()

        // Add the x-axis and label
        svg.append("g")
            .attr('class', 'axis-group')
            .attr("transform", `translate(${margin.left}, ${innerHeight})`)
            .call(d3.axisBottom(x))
            .selectAll("text")
                .attr("class", "x-axis x-axis-text")
                .attr("font-size", 15)

        // Add the y-axis and label
        svg.append("g")
            .attr('class', 'axis-group')
            .attr("transform", `translate(${margin.left}, 0)`)
            .call(d3.axisLeft(y))
                .attr("class", "y-axis y-axis-text")
            .transition()

    }, [maxWidth, height, reportDataUnsorted, property])

    const min = (a:number, b:number) => (a < b)? a : b

    return (
        <>
            <svg
                className='graph-font-global'
                ref={ref}
            />
        </>
    )
}
