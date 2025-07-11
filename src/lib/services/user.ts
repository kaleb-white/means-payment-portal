import { redirect } from "next/navigation"
import { supabaseClient } from "../supabase/supabase"

export async function getCurrentUser() {
    // Create supabase client
    const supabase = await supabaseClient()

    // Ask the client for the current user
    const { data, error } = await supabase.auth.getUser()
    if (error || !data?.user) {
        redirect('/')
    }

    return data.user
}
