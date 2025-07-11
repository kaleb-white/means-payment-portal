import { debugLogger } from "@/lib/error";
import { User, AuthServices } from "../database/interfaces";
import { supabaseClient } from "./supabase_client";

export class SupabaseAuthService implements AuthServices {
    async signUp(email: string, password: string): Promise<Error | null> {
        const supabase = await supabaseClient()

        // Check for current user and sign them out
        const { user, currentUserError } = await this.getCurrentUser()
        if (user) {
            const { error } = await supabase.auth.signOut()
            if (error) return error
        }

        const { error } = await supabase.auth.signUp({email: email, password: password})
        if (error) return error
        return null
    }

    async signIn(email: string, password: string): Promise<Error |  null> {
        const supabase = await supabaseClient()

        // Check for current user and sign them out
        const { user, currentUserError } = await this.getCurrentUser()
        if (user) {
            const { error } = await supabase.auth.signOut()
            if (error) return error
        }

        const { error } = await supabase.auth.signInWithPassword({email: email, password: password})
        if (error) return error
        return null
    }

    async signOut(): Promise<void> {
        const supabase = await supabaseClient()
        supabase.auth.signOut()
    }

    async getCurrentUser(): Promise<{user: User | null,  currentUserError: Error | null}> {
        const supabase = await supabaseClient()
        const { data, error } = await supabase.auth.getUser()
        if (!data.user) return {user: null, currentUserError: new Error("User not found")}
        return {user: data.user as User, currentUserError: error}
    }
}
