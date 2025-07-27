import { jwtDecode } from "jwt-decode";
import { AdminServicesObj } from "../../database/interfaces";
import { supabaseClient } from "../supabase_client";

export class SupabaseAdminService implements AdminServicesObj {
    static async isUserAdmin(): Promise<boolean> {
        'use server'
        const supabase = await supabaseClient()
        const session = (await (supabase.auth.getSession())).data.session
        if (!session) return false
        const role = jwtDecode(session.access_token).user_role // despite the error, works
        if (!role || role !== 'admin') return false
        return true
    }
}
