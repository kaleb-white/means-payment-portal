import { redirect } from "next/navigation";
import { User, AuthServices } from "../database/interfaces";
import { supabaseClient } from "./supabase_client";

export class SupabaseAuthService implements AuthServices {
    async signUp(email: string, password: string): Promise<Error | null> {
        const supabase = await supabaseClient()

        // Check for current user and sign them out
        const { data } = await supabase.auth.getUser()
        if (data.user) await supabase.auth.signOut()

        // Sign up
        const { error } = await supabase.auth.signUp({email: email, password: password})
        if (error) return error

        return null
    }

    async signIn(email: string, password: string): Promise<Error |  null> {
        const supabase = await supabaseClient()

        // Check for current user and sign them out
        const { data } = await supabase.auth.getUser()
        if (data.user) await supabase.auth.signOut()

        // Sign in
        const { error } = await supabase.auth.signInWithPassword({email: email, password: password})
        if (error) return error
        return null
    }

    async signOut(): Promise<Error | null> {
        const supabase = await supabaseClient()
        const { error } = await supabase.auth.signOut()
        if (!error) return null
        return error
    }

    async getCurrentUser(): Promise<User> {
        const supabase = await supabaseClient()
        const { data, error } = await supabase.auth.getUser()
        if (error) redirect(`/?error=${error.message}`)
        if (!data.user) redirect(`/?error=${"null user returned while trying to find user"}`)
        return data.user as User
    }
}
