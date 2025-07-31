import DatabaseContext from "@/lib/database/database_context";
import { QuarterlyReportSchema } from "@/lib/zod";
import { NextRequest } from "next/server";

export async function POST(request: NextRequest) {
    const body = await request.json()
    if (!body) return new Response('', {status: 400, statusText: 'Body required'})

    let parseResult
    try {
        parseResult = QuarterlyReportSchema.parse(body)
    } catch {
        return new Response('', {status: 400, statusText:'Error while parsing body data'})
    }

    const dbContext = await DatabaseContext()
    const serviceResponse = await dbContext.analyticsService.updateQuarterlyReport(parseResult)

    if (serviceResponse instanceof Error) return new Response('', {status: 400, statusText: serviceResponse.message})

    return new Response('', {status: 200, statusText: 'Report created succesfully'})
}
