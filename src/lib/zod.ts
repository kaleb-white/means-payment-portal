import * as z from "zod"

export const signInSchema = z.object({
    email: z.email("Submitted email invalid"),
    password: z.string().min(1, "Must be at least one character")
})
