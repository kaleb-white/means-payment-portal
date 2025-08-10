import DatabaseContext from "@/lib/database/database_context";
import { UserServices, staticImplements } from "../../../database/interfaces";
import { CouponCode, User } from "../../../database/schemas"
import { supabaseClient } from "../supabase_client";
import { dbTableNames } from "@/configs";

@staticImplements<UserServices>()
export class SupabaseUserService  {
    static async getUserById(id: string): Promise<User | null> {
        'use server'
        throw new Error("Method not implemented.");
    }

    static async updateUser(id: string, updates: Partial<User>): Promise<User> {
        'use server'
        throw new Error("Method not implemented.");
    }

    static async deleteUser(id: string): Promise<void> {
        'use server'
        throw new Error("Method not implemented.");
    }

    static async getUserCouponByUser(user: User): Promise<string | null> {
        'use server'
        const supabase = await supabaseClient()
        const { data, error } = await supabase.from('coupon_codes').select().eq('email', user.email).limit(1)
        if (!data || error) return null
        return data.at(0).coupon_code
    }

    static async getUserCouponByEmail(email: string): Promise<CouponCode| Error> {
        'use server'
        // Check role
        const dbContext = await DatabaseContext()
        if (!await dbContext.adminService.isUserAdmin()) return new Error("Server action called by non admin")

        // Fetch row
        const supabase = await supabaseClient()
        const tableName = (process.env.IS_PROD === '1') ? dbTableNames.couponCodes : dbTableNames.testCouponCodes
        const { data, error } = await supabase.from(tableName)
            .select('*')
            .eq('email', email)

        if (error) return new Error(`The database returned an error: ${error.message}`)
        if (!data) return new Error("No coupon codes were returned by the database")
        if (data.length !== 1) return new Error("More than one code is assosciated with this email address")

        let couponCode
        try {
            couponCode = data[0] as CouponCode
        } catch {
            return new Error("There was an issue with the data returned by the databse. Please contact the server admin")
        }

        return couponCode
    }

    static async getAllCouponCodes(): Promise<Array<CouponCode> | Error> {
        'use server'
        // Check role
        const dbContext = await DatabaseContext()
        if (!await dbContext.adminService.isUserAdmin()) return new Error("Server action called by non admin")

        // Fetch all rows
        const supabase = await supabaseClient()
        const tableName = (process.env.IS_PROD === '1') ? dbTableNames.couponCodes : dbTableNames.testCouponCodes
        const { data, error } = await supabase.from(tableName)
            .select('*')

        if (error) return new Error(`The database returned an error: ${error.message}`)
        if (!data) return new Error("No coupon codes were returned by the database")

        let couponCodes
        try {
            couponCodes = data.map((c) => {return {email:c.email, couponCode:c.coupon_code}})
        } catch {
            return new Error("There was an issue with the data returned by the databse. Please contact the server admin")
        }

        return couponCodes
    }

    static async createCouponCode(email: string, couponCode: string): Promise<boolean | Error> {
        'use server'
        // Check role
        const dbContext = await DatabaseContext()
        if (!await dbContext.adminService.isUserAdmin()) return new Error("Server action called by non admin")

        // Set up supabase
        const supabase = await supabaseClient()
        const tableName = (process.env.IS_PROD === '1') ? dbTableNames.couponCodes : dbTableNames.testCouponCodes

        // Check if report is duplicate
        const matches = await Promise.all([
            supabase.from(tableName).select('email, coupon_code').eq('email', email),
            supabase.from(tableName).select('email').eq('email', email),
            supabase.from(tableName).select('coupon_code').eq('coupon_code', couponCode)
        ])
        if (matches[0].data && matches[0].data.length > 0) return new Error("A coupon exists with that email and coupon code")
        if (matches[1].data && matches[1].data.length > 0) return new Error("A coupon exists with that email")
        if (matches[2].data && matches[2].data.length > 0) return new Error("A coupon exists with that coupon code")

        const { data, error } = await supabase.from(tableName)
            .insert([{email: email, coupon_code: couponCode}])
            .select()

        if (error) return error
        if (!data) return new Error("No data was inserted as database returned no data")

        return true
    }


    static async updateCouponCode(email: string, couponCode: string): Promise<boolean | Error> {
        'use server'
        // Check role
        const dbContext = await DatabaseContext()
        if (!await dbContext.adminService.isUserAdmin()) return new Error("Server action called by non admin")

        // Set up supabase
        const supabase = await supabaseClient()
        const tableName = (process.env.IS_PROD === '1') ? dbTableNames.couponCodes : dbTableNames.testCouponCodes

        // Make sure match exists
        const match = await supabase.from(tableName)
            .select('email')
            .eq('email', email)
        if (!match.data) return new Error("No matching email was found")
        if (match.data.length !== 1) return new Error(match.data.length === 0 ? "No matching email was found" : "Multiple matching emails were found")

        // Perform update
        const { data, error } = await supabase.from(tableName)
            .update({'coupon_code': couponCode})
            .eq('email', email)
            .select()

        // If error, return it
        if (error) return error
        if (!data) return new Error("No data was updated as database returned no data")

        return true
    }

    static async updateEmailInCouponCode(email: string, couponCode: string): Promise<boolean | Error> {
        'use server'
        // Check role
        const dbContext = await DatabaseContext()
        if (!await dbContext.adminService.isUserAdmin()) return new Error("Server action called by non admin")

        // Set up supabase
        const supabase = await supabaseClient()
        const tableName = (process.env.IS_PROD === '1') ? dbTableNames.couponCodes : dbTableNames.testCouponCodes

        // Make sure match exists
        const match = await supabase.from(tableName)
            .select('coupon_code')
            .eq('coupon_code', couponCode)
        if (!match.data) return new Error("No matching coupon code was found")
        if (match.data.length !== 1) return new Error(match.data.length === 0 ? "No matching coupon code was found" : "Multiple matching coupon codes were found")

        // Perform update
        const { data, error } = await supabase.from(tableName)
            .update({'email': email})
            .eq('couponCode', couponCode)

        // If error, return it
        if (error) return error
        if (!data) return new Error("No data was updated as database returned no data")

        return true
    }

    static async deleteCouponCode(email:string, couponCode: string): Promise<boolean | Error> {
        'use server'
        // Check role
        const dbContext = await DatabaseContext()
        if (!await dbContext.adminService.isUserAdmin()) return new Error("Server action called by non admin")

        // Set up supabase
        const supabase = await supabaseClient()
        const tableName = (process.env.IS_PROD === '1') ? dbTableNames.couponCodes : dbTableNames.testCouponCodes

        // Make sure match exists
        const match = await supabase.from(tableName)
            .select('coupon_code, email')
            .eq('coupon_code', couponCode)
            .eq('email', email)
        if (!match.data) return new Error("No matching coupon code was found")
        if (match.data.length !== 1) return new Error(match.data.length === 0 ? "No matching coupon code was found" : "Multiple matching coupon codes were found")

        // Perform delete
        const { error, data } = await supabase.from(tableName)
            .delete()
            .eq('email', email)
            .eq('coupon_code', couponCode)
            .select()

        // If error, return it
        if (error) return error
        if (data && data.length !== 1) return new Error(data.length === 0? "No rows were actually deleted, whoops": "Multiple rows were deleted..... sorry, this means I fucked up")

        return true
    }
}
