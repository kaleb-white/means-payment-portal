"use server"

import { signInSchema } from "./zod";

import { redirect } from "next/navigation";

import { treeifyError } from "zod";
import { revalidatePath } from "next/cache";
import { DatabaseContext } from "./services/database/database_context";

// Reference docs: https://supabase.com/docs/guides/auth/server-side/nextjs?queryGroups=router&router=app

export async function signInSubmit(_previousState, formData: FormData) {
    // Validate Fields
    const formEmail = formData.get("email"); const formPassword = formData.get("password");
    const parseResult = signInSchema.safeParse({email: formEmail, password: formPassword})
    if (!parseResult.success) {
        return treeifyError(parseResult.error).properties
    }

    // This cast is fine: https://zod.dev/basics?id=handling-errors
    const data = parseResult.data as {email: string, password: string}

    const error = await DatabaseContext().authService.signIn(data.email, data.password)

    if (error instanceof Error) {revalidatePath('/'); redirect('/')}
    redirect('/home')
}

export async function signUpSubmit(_previousState, formData: FormData) {
    // Validate Fields
    const formEmail = formData.get("email"); const formPassword = formData.get("password");
    const parseResult = signInSchema.safeParse({email: formEmail, password: formPassword})
    if (!parseResult.success) {
        return treeifyError(parseResult.error).properties
    }

    // This cast is fine: https://zod.dev/basics?id=handling-errors
    const data = parseResult.data as {email: string, password: string}

    const error = await DatabaseContext().authService.signUp(data.email, data.password)

    // TODO: Update these to return an error instead?
    if (error instanceof Error) {revalidatePath('/'); redirect('/')}
    redirect('/home')
}
