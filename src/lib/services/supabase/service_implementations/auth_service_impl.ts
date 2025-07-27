import { redirect } from "next/navigation";
import { User, AuthServicesObj } from "../../database/interfaces";
import { supabaseClient } from "../supabase_client";

export class SupabaseAuthService implements AuthServicesObj {
    static async signUp(email: string, password: string): Promise<Error | null> {
        'use server'
        const supabase = await supabaseClient()

        // Check for current user and sign them out
        const { data } = await supabase.auth.getUser()
        if (data.user) await supabase.auth.signOut()

        // Sign up
        const { error } = await supabase.auth.signUp({email: email, password: password})
        if (error) return error

        return null
    }

    static async signIn(email: string, password: string): Promise<Error |  null> {
        'use server'
        const supabase = await supabaseClient()

        // Check for current user and sign them out
        const { data } = await supabase.auth.getUser()
        if (data.user) await supabase.auth.signOut()

        // Sign in
        const { error } = await supabase.auth.signInWithPassword({email: email, password: password})
        if (error) return error
        return null
    }

    static async signOut(): Promise<Error | null> {
        'use server'
        const supabase = await supabaseClient()
        const { error } = await supabase.auth.signOut()
        if (!error) return null
        return error
    }

    static async getCurrentUser(): Promise<User> {
        'use server'
        const supabase = await supabaseClient()
        const { data, error } = await supabase.auth.getUser()
        if (error) redirect(`/?error=${error.message}`)
        if (!data.user) redirect(`/?error=${"null user returned while trying to find user"}`)
        return data.user as User
    }
}
