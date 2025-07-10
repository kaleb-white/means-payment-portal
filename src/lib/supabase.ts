import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

// Reference docs:  https://supabase.com/docs/reference/javascript
//                  https://supabase.com/docs/guides/auth/server-side/nextjs

export async function supabaseClient() {
    // Create cookie store
    const cookieStore = await cookies()

    // Ensure supabase url and key are available
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    if (!url) {throw new Error("While creating supabase client, did not find env variable with supabase url")}
    if (!key) {throw new Error("While creating supabase client, did not find env variable with supabase key")}

    return createServerClient(
        url,
        key,
        {
            cookies: {
                getAll() {
                    return cookieStore.getAll()
                },
                setAll(cookiesToSet) {
                    try {
                        cookiesToSet.forEach(({ name, value, options }) =>
                            cookieStore.set(name, value, options)
                        )} catch {
                            // The `setAll` method was called from a Server Component.
                            // This can be ignored if you have middleware refreshing
                            // user sessions.
                        }
                },
            },
        }
    )}

export async function supabaseGetUser(email: string) {
    const supabase = supabaseClient()
    const { data, error } = await supabase.from('users').select('*') // eq('email', email).limit(1)
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
