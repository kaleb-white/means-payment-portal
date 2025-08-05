import DatabaseContext from "@/lib/database/database_context";
import { QuarterlyReportSchema } from "@/lib/zod";
import { NextRequest } from "next/server";

export async function POST(request: NextRequest) {
    const body = await request.json()
    if (!body) return new Response('', {status: 400, statusText: 'Body required'})

    const parseResult = QuarterlyReportSchema.safeParse(body)

    if (parseResult.error) {
        return new Response('', {status: 400, statusText: "Error while parsing body data"})
    }

    const dbContext = await DatabaseContext()

    const quarters = await dbContext.analyticsService.getAllQuarterlyReports([{year: String(parseResult.data.year), quarter: String(parseResult.data.quarter)}])
    if (!(quarters instanceof Error) && !(quarters.length === 0)) {
        return new Response('', {status: 400, statusText: "A quarter already exists for that report! Delete that quarter first."})
    }

    const serviceResponse = await dbContext.analyticsService.createQuarterlyReport(parseResult.data)

    if (serviceResponse instanceof Error) return new Response('', {status: 400, statusText: serviceResponse.message})

    return new Response('', {status: 200, statusText: 'Report created succesfully'})
}
