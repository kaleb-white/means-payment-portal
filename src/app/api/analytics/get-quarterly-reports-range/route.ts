import DatabaseContext from "@/lib/database/database_context";
import { RangeSchema } from "@/lib/zod";
import { NextRequest } from "next/server";

export async function POST(request: NextRequest) {
    const body = await request.json()
    if (!body) return new Response('', {status: 400, statusText: 'Body required'})

    const parseResult = RangeSchema.safeParse(body)

    if (parseResult.error) return new Response('', {status: 400, statusText:'Error while parsing body data'})

    const dbContext = await DatabaseContext()
    const serviceResponse = await dbContext.analyticsService.getQuarterlyReportsRange(parseResult.data.start, parseResult.data.stop)

    if (serviceResponse instanceof Error) return new Response('', {status: 400, statusText: serviceResponse.message})

    return new Response(JSON.stringify(serviceResponse), {status: 200, statusText: 'Succesfully fetched range'})
}
