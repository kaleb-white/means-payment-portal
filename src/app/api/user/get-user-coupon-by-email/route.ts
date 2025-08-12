import DatabaseContext from "@/lib/database/database_context";
import { email } from "zod";

import { NextRequest } from "next/server";

export async function POST(request: NextRequest) {
    const body = await request.json()
    if (!body) return new Response('', {status: 400, statusText: 'Body required'})

    const parseResult = email().safeParse(body)
    if (parseResult.error) return new Response("", {status: 400, statusText: 'Invalid input'})
    if (!parseResult.data) return new Response('', {status: 400, statusText:'Parsing succeeded, but no data was returned. Contact an administrator'})


    const dbContext = await DatabaseContext()
    const serviceResponse = await dbContext.userService.getUserCouponByEmail(parseResult.data)

    if (serviceResponse instanceof Error) return new Response('', {status: 400, statusText: serviceResponse.message})

    return new Response(JSON.stringify(serviceResponse), {status: 200, statusText: "Succesfully got coupon code"})
}
