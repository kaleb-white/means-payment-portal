"use server"

import { baseUrls } from "@/configs";

import { signInSchema } from "../zod";
import { treeifyError } from "zod";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

import { DatabaseContext } from "./database/database_context";

// Reference docs: https://supabase.com/docs/guides/auth/server-side/nextjs?queryGroups=router&router=app

export async function signInSubmit(_previousState: unknown, formData: FormData) {

    // Validate Fields
    const formEmail = formData.get("email"); const formPassword = formData.get("password");
    const parseResult = signInSchema.safeParse({email: formEmail, password: formPassword})
    if (!parseResult.success) {
        return treeifyError(parseResult.error).properties
    }

    // This cast is fine: https://zod.dev/basics?id=handling-errors
    const data = parseResult.data as {email: string, password: string}

    // Call context
    const error = await (await DatabaseContext()).authService.signIn(data.email, data.password)

    // On error redirect with error message in url params
    if (error instanceof Error) {revalidatePath(baseUrls.LOGIN); redirect(`${baseUrls.LOGIN}?error=${error.message}`)}

    redirect(baseUrls.ANALYTICS)
}

export async function signUpSubmit(_previousState: unknown, formData: FormData) {
    // Validate Fields
    const formEmail = formData.get("email"); const formPassword = formData.get("password");
    const parseResult = signInSchema.safeParse({email: formEmail, password: formPassword})
    if (!parseResult.success) {
        return treeifyError(parseResult.error).properties
    }

    // This cast is fine: https://zod.dev/basics?id=handling-errors
    const data = parseResult.data as {email: string, password: string}

    // Call context
    const error = await (await DatabaseContext()).authService.signUp(data.email, data.password)

    // On error redirect with error message in url params
    if (error instanceof Error) {revalidatePath(baseUrls.LOGIN); redirect(`${baseUrls.LOGIN}?error=${error.message}`)}

    redirect(baseUrls.ANALYTICS)
}

export async function signOutSubmit() {
    const dbContext = await DatabaseContext()
    const error = await dbContext.authService.signOut()
    if (error) redirect(`${baseUrls.LOGIN}?error=${error.message}`)
    redirect(baseUrls.LOGIN)
}
