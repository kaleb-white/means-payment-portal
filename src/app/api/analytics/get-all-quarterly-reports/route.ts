import DatabaseContext from "@/lib/database/database_context";
import { dateInYearQuarterArray } from "@/lib/zod";
import { NextRequest } from "next/server";
import * as z from "zod"

export async function GET(request: NextRequest) {
    const body = await request.json()
    if (!body) return new Response('', {status: 400, statusText: 'Body required'})

    let parseResult
    const arrayParseResult = dateInYearQuarterArray.safeParse(body)
    const numberParseResult = z.number().safeParse(body)

    if (arrayParseResult.error && numberParseResult.error) return new Response('', {status: 400, statusText:'Error while parsing body data'})
    if (arrayParseResult.error && numberParseResult.data) parseResult = numberParseResult.data
    if (arrayParseResult.data && numberParseResult.error) parseResult = arrayParseResult.data

    const dbContext = await DatabaseContext()
    const serviceResponse = await dbContext.analyticsService.getAllQuarterlyReports(parseResult)

    if (serviceResponse instanceof Error) return new Response('', {status: 400, statusText: serviceResponse.message})

    return new Response('', {status: 200, statusText: 'Report created succesfully'})
}
