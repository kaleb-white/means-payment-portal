import { AnalyticsPropertiesAsArray } from "../_client_interfaces/types";
import Papa from 'papaparse';
import { isStringOrNumberArray } from "./type_checks";
import { QuarterlyReport, ReportDataRowUncast } from "@/lib/database/schemas";
import _ from "lodash";
import { quarterToDateInYearQuarter } from "@/format_converter";

export async function parseCsvAsQuarterlyReport(file: File): Promise<QuarterlyReport | Error> {
    const parseOptions: Papa.ParseConfig = {
        transformHeader: undefined,
        dynamicTyping: true,
        step: undefined,
        skipEmptyLines: true,
        fastMode: undefined,
        beforeFirstChunk: undefined,
        transform: (value) => value.trimEnd().trimStart(),
    }

    const fileText = await file.text()

    // Check for headers
    const headers = Papa.parse(fileText, {...parseOptions, preview: 1})
    const requiredHeaders = [...AnalyticsPropertiesAsArray, "Period", "Coupon Code"]

    if (!isStringOrNumberArray(headers.data[0])) return new Error("No data was found in the csv, or a data type that wasn't string or number was found!")
    const missingHeaders = requiredHeaders.map(h => !(headers.data[0] as Array<string | number>).includes(h)? h : null).filter(e => e)
    if (missingHeaders.length !== 0) {
        // Don't try and fix headers, require them
        return new Error(`Your uploaded csv ${file.name} is missing these headers: ${missingHeaders.join(', ')}`)
    }

    // Parse and error check
    const parseResult = Papa.parse(fileText, {...parseOptions, header: true})
    if (parseResult.errors.length > 0) return new Error(`Parse failed with errors: ${parseResult.errors.map(e => e.message).join(', ')}`)

    // Try type conversion
    let data
    try {
        data = parseResult.data as Array<ReportDataRowUncast>
    } catch (err) {
        return new Error(`Parsing succeeded, but some types might be incorrect. Ensure that financial fields are in financial form, and that numerical fields are numerical.`)
    }

    // Check period - if more than 1, throw error
    const periods = _.uniq(data.map(row => row.Period))
    if (periods.length !== 1) return new Error(`Found two separate posible quarters (${periods.join(', ')}); please ensure that period fields are not unique`)

    // Create csvFile
    const diyq = quarterToDateInYearQuarter(periods[0])
    const csv: QuarterlyReport = {
        year: Number(diyq.year),
        quarter: Number(diyq.quarter),
        report_data: data
    }

    return csv
}
