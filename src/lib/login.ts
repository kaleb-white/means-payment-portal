"use server"

import { signInSchema } from "./zod";

import { redirect } from "next/navigation";
import { supabaseClient } from "./supabase/supabase";

import { treeifyError } from "zod";
import { revalidatePath } from "next/cache";

// Reference docs: https://supabase.com/docs/guides/auth/server-side/nextjs?queryGroups=router&router=app

export async function signInSubmit(_previousState, formData: FormData) {
    // Validate Fields
    const formEmail = formData.get("email"); const formPassword = formData.get("password");
    const parseResult = signInSchema.safeParse({email: formEmail, password: formPassword})
    if (!parseResult.success) {
        return treeifyError(parseResult.error).properties
    }

    // This is fine: https://zod.dev/basics?id=handling-errors
    const data = parseResult.data as {email: string, password: string}

    const supabase = await supabaseClient()
    const { error } = await supabase.auth.signInWithPassword(data)

    if (error) {revalidatePath('/'); redirect('/')}
    redirect('/home')
}

export async function signUpSubmit(_previousState, formData: FormData) {
    // Validate Fields
    const formEmail = formData.get("email"); const formPassword = formData.get("password");
    const parseResult = signInSchema.safeParse({email: formEmail, password: formPassword})
    if (!parseResult.success) {
        return treeifyError(parseResult.error).properties
    }

    // This is fine: https://zod.dev/basics?id=handling-errors
    const data = parseResult.data as {email: string, password: string}

    const supabase = await supabaseClient()
    const { error } = await supabase.auth.signUp(data)

    if (error) {revalidatePath('/'); redirect('/')}
    redirect('/home')
}
