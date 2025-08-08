import DatabaseContext from "@/lib/database/database_context";
import { CouponCodeSchema } from "@/lib/zod";
import { NextRequest } from "next/server";

export async function POST(request: NextRequest) {
    const body = await request.json()
    if (!body) return new Response('', {status: 400, statusText: 'Body required'})

    const parseResult = CouponCodeSchema.safeParse(body)

    if (parseResult.error || !parseResult.data) return new Response('', {status: 400, statusText: "Error while parsing body data"})

    const dbContext = await DatabaseContext()
    const serviceResponse = await dbContext.userService.createCouponCode(parseResult.data.email, parseResult.data.couponCode)

    if (serviceResponse instanceof Error) return new Response('', {status: 400, statusText: serviceResponse.message})

    return new Response('', {status: 200, statusText: 'Coupon code created succesfully'})
}
