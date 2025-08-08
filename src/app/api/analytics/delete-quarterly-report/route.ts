import DatabaseContext from "@/lib/database/database_context";
import { DateInYearQuarterSchema } from "@/lib/zod";

import { NextRequest } from "next/server";

export async function DELETE(request: NextRequest) {
    const body = await request.json()
    if (!body) return new Response('', {status: 400, statusText: 'Body required'})

    const parseResult = DateInYearQuarterSchema.safeParse(body)
    if (parseResult.error || !parseResult.data) return new Response("", {status: 400, statusText: 'Error while parsing body data'})

    const dbContext = await DatabaseContext()
    const serviceResponse = await dbContext.analyticsService.deleteQuarterlyReport(parseResult.data)

    if (serviceResponse instanceof Error) return new Response('', {status: 400, statusText: serviceResponse.message})

    return new Response('', {status: 200, statusText: 'Report created succesfully'})
}
