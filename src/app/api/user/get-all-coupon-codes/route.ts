import DatabaseContext from "@/lib/database/database_context";

export async function GET() {
    const dbContext = await DatabaseContext()
    const serviceResponse = await dbContext.userService.getAllCouponCodes()

    if (serviceResponse instanceof Error) return new Response('', {status: 400, statusText: serviceResponse.message})

    return new Response(JSON.stringify(serviceResponse), {status: 200, statusText: "Succesfully got all coupon codes"})
}
