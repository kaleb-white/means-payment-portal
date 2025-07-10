import { supabaseGetUser } from "./supabase"
import bcrypt from "bcryptjs"

export async function getUserFromDb(email: string, pwHash: string) {
    // Get the user from supabase
    const supabaseUser = await supabaseGetUser(email)

    if (!supabaseUser) return null

    // Extract their password hash
    const supabasePwHash = supabaseUser.saltedHash

    // Check their db pwd hash against form pwd hash (db hash = supabasePwHash (ie correct hash))
    const authPass = await bcrypt.compare(pwHash, supabasePwHash)

    // Password is incorrect
    if (!authPass) return null

    return supabaseUser
}
