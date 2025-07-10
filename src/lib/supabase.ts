import { createClient } from '@supabase/supabase-js'

// Reference docs: https://supabase.com/docs/reference/javascript

export function supabaseClient() {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    if (!url) {throw new Error("While creating supabase client, did not find env variable with supabase url")}
    if (!key) {throw new Error("While creating supabase client, did not find env variable with supabase key")}
    return createClient(url, key)
}

export async function supabaseGetUser(email: string) {
    const supabase = supabaseClient()
    const { data, error } = await supabase.from('users').select('*') // eq('email', email)
    console.log("\nData received: ", JSON.stringify(data), "\n")
    if (error) throw error
    if (data.length === 0) return null
    if (!data) return null
    return data[0]
}

export async function supabaseGetSalt(email: string) {
    const user = await supabaseGetUser(email)
    return user.salt
}

export async function supabaseGetPasswordHash(email: string) {
    const user = await supabaseGetUser(email)
    return user.saltedHash
}
