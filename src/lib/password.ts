import * as b from 'bcryptjs'
import { supabaseGetSalt } from './supabase'

// Reference: https://auth0.com/blog/adding-salt-to-hashing-a-better-way-to-store-passwords/
// Why bcrypt over sha256 (etc)? https://auth0.com/blog/hashing-in-action-understanding-bcrypt/
export default async function saltAndHashPassword(email: string, password: string) {
    // Retrieve salt by email
    const salt = await supabaseGetSalt(email)

    if (!salt) return undefined

    // Generate a hash, passing the salt to bcryptjs
    const hash = await b.hash(password, salt)

    return hash
}
