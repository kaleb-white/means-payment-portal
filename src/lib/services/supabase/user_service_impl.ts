import { User, UserServices } from "../database/interfaces";
import { supabaseClient } from "./supabase_client";

export default class SupabaseUserService implements UserServices  {
    async getUserById(id: string): Promise<User | null> {
        throw new Error("Method not implemented.");
    }
    async updateUser(id: string, updates: Partial<User>): Promise<User> {
        throw new Error("Method not implemented.");
    }
    async deleteUser(id: string): Promise<void> {
        throw new Error("Method not implemented.");
    }
    async getUserCouponByUser(user: User): Promise<string | null> {
        const supabase = await supabaseClient()
        const { data, error } = await supabase.from('coupon_codes').select().eq('email', user.email).limit(1)
        if (!data || error) return null
        return data.at(0).coupon_code
    }
}
