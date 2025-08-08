import DatabaseContext from "@/lib/database/database_context";
import { dateInYearQuarterArray } from "@/lib/zod";

import { NextRequest } from "next/server";

export async function POST(request: NextRequest) {
    const body = await request.json()
    if (!body) return new Response('', {status: 400, statusText: 'Body required'})

    let parseResult
    try {
        parseResult = dateInYearQuarterArray.parse(body)
    } catch {
        return new Response("", {status: 400, statusText: 'Error while parsing body data'})
    }


    const dbContext = await DatabaseContext()
    const quarterlyReports = await dbContext.analyticsService.getUserQuarterlyReports(parseResult)

    return new Response(JSON.stringify(quarterlyReports), {status: 200, statusText: "Succesfully got reports"})
}
