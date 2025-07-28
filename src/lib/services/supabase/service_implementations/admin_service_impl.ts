import { jwtDecode } from "jwt-decode";
import { AdminServicesObj } from "../../database/interfaces";
import { supabaseClient } from "../supabase_client";
import { redirect } from "next/navigation";
import { baseUrls } from "@/configs";

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

    static async checkAdminRole(): Promise<boolean> {
        if (!(await this.isUserAdmin())) {
            redirect(`${baseUrls.LOGIN}/?error=Tried to access a protected action without the proper role`)
        }
        return true
    }
}
