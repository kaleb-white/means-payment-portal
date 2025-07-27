import { User, UserServicesObj } from "../../database/interfaces";
import { supabaseClient } from "../supabase_client";

export class SupabaseUserService implements UserServicesObj  {
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
}
