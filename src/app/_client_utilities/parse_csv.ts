'use server'

import { AnalyticsPropertiesAsArray } from "../_client_interfaces/types";
import Papa from 'papaparse';
import { isStringOrNumberArray, isStringArray } from "./type_checks";
import { QuarterlyReport, ReportDataRowUncast, CouponCode } from "@/lib/database/schemas";
import _ from "lodash";
import { quarterToDateInYearQuarter } from "@/format_converter";
import * as z from 'zod';
import { checkHeaders } from './header_check_generous'

// Reference: https://www.papaparse.com/docs
const parseOptions: Papa.ParseConfig = {
    transformHeader: undefined,
    dynamicTyping: true,
    step: undefined,
    skipEmptyLines: true,
    fastMode: undefined,
    beforeFirstChunk: undefined,
    transform: (value) => value.trimEnd().trimStart(),
}

export async function parseCsvAsQuarterlyReport(file: File): Promise<QuarterlyReport | Error> {
    'use server'
    const fileText = await file.text()

    // Check for headers
    const headerData = Papa.parse(fileText, {...parseOptions, preview: 1})
    if (headerData.errors.length > 0) return new Error(`Errors while parsing csv: ${headerData.errors.map(e => e.message).join(", ")}`)
    const requiredHeaders = [...AnalyticsPropertiesAsArray, "Period", "Coupon Code"]
    const headers = (headerData.data[0] as Array<unknown>).filter(e => e)

    if (!isStringOrNumberArray(headers)) return new Error("No data was found in the csv, or a data type that wasn't string or number was found!")
    const missingHeaders = requiredHeaders.map(h => !(headers as Array<string | number>).includes(h)? h : null).filter(e => e)
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

export async function parseCsvAsCouponCode(file: File): Promise<CouponCode[] | Error> {
    'use server'
    const fileText = await file.text()

    // Pull out headers
    const headerData = Papa.parse(fileText, {...parseOptions, preview: 1})
    if (headerData.errors.length > 0) return new Error(`Errors while parsing csv: ${headerData.errors.map(e => e.message).join(', ')}`)
    const requiredHeaders = ["Email", "Coupon Code"]
    const headers = (headerData.data[0] as Array<unknown>).filter(e => e)

    // Check for types and headers
    if (!isStringArray(headers)) return new Error("No data was found in the csv, or a data type that wasn't string or number was found!")
    const {missingHeaders, mappedHeaders} = checkHeaders(requiredHeaders, headers as Array<string>)
    if (missingHeaders.length !== 0) {
        // Don't try and fix headers, require them
        return new Error(`Your uploaded csv ${file.name} is missing these headers: ${missingHeaders.join(', ')}`)
    }

    // Parse and error check
    const parseResult = Papa.parse(fileText, {
        ...parseOptions,
        header: true,
    })
    if (parseResult.errors.length > 0) return new Error(`Parse failed with errors: ${parseResult.errors.map(e => e.message).join(', ')}`)

    // Try type conversion
    let data
    try {
        data = parseResult.data.map(c => {return {email: c[mappedHeaders["Email"]], couponCode: c[mappedHeaders["Coupon Code"]]}}).filter(e => e.couponCode && e.email)
    } catch (err) {
        return new Error(`Parsing succeeded, but some types might be incorrect. Ensure that financial fields are in financial form, and that numerical fields are numerical.`)
    }

    // Check emails for uniqueness
    const emailFreq: {[key: string]: number} = {}
    data.map(row => row.email).forEach((e) => emailFreq[e]? emailFreq[e] = emailFreq[e] + 1 : emailFreq[e] = 1)
    const duplicates = Object.keys(emailFreq).map((e) => emailFreq[e] > 1? e : null).filter(e => e)
    if (duplicates.length > 0) return new Error(`Found duplicate email(s): ${duplicates.join(', ')}`)

    // Check emails are emails
    const parses = data.map(row => z.email().safeParse(row.email)).map(res => res.error).filter(e => e)
    if (parses.length > 0) return new Error("Failed to parse some emails! Ensure that all emails are in an email format")

    return data
}
