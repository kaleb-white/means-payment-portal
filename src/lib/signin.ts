"use server"

import { signIn } from "@/auth";
import { signInSchema } from "./zod";

export async function signInSubmit(previousState, formData: FormData) {
    // Validate Fields
    const formEmail = formData.get("email"); const formPassword = formData.get("password");
    const parseResult = signInSchema.safeParse({email: formEmail, password: formPassword})
    if (!parseResult.success) {
        return {
            errors: parseResult.error.flatten().fieldErrors
        }
    }
    // This is fine: https://zod.dev/basics?id=handling-errors
    const {email, password} = parseResult.data as {email: string, password: string}



    await signIn("credentials", {email: email, password: password})
}
