import { AnalyticsServices, User } from "../database/interfaces";
import { supabaseClient } from "./supabase_client";

export class SupabaseAnayticsService implements AnalyticsServices {
    async getUserQuarterlyReports(user: User, quarters: number): Promise<null> {
        const supabase = await supabaseClient()

        //const { data: couponCodeData, error: couponError } = await supabase.from('coupon_codes').select('email, coupon_code').eq('email', user.email)
        //if (couponError) throw couponError

        //const { data: userAnalytics, error: analyticsError } = await supabase.from('2025Q1').select('*').eq('Coupon Code', couponCodeData?.at(0)?.coupon_code)
        //if (analyticsError) throw analyticsError

        //console.log(userAnalytics)
        return null
    }
}
