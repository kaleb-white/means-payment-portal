import DatabaseContext from "@/lib/database/database_context";
import { QuarterlyReportSchema } from "@/lib/zod";
import { NextRequest } from "next/server";

export async function POST(request: NextRequest) {
    const body = await request.json()
    if (!body) return new Response('', {status: 400, statusText: 'Body required'})

    const parseResult = QuarterlyReportSchema.safeParse(body)
    if (parseResult.error) return new Response('', {status: 400, statusText: 'Invalid input. Check that financial numbers are in the correct format, or remove script injections :)'})
    if (!parseResult.data) return new Response('', {status: 400, statusText: 'Parsing succeeded, but no data was returned. Contact administrator.'})


    const dbContext = await DatabaseContext()
    const serviceResponse = await dbContext.analyticsService.updateQuarterlyReport({year: parseResult.data.year, quarter: parseResult.data.quarter, report_data: parseResult.data.report_data})

    if (serviceResponse instanceof Error) return new Response('', {status: 400, statusText: serviceResponse.message})

    return new Response('', {status: 200, statusText: 'Report created succesfully'})
}
