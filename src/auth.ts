import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"

import { ZodError } from "zod"
import { signInSchema } from "./lib/zod"

import saltAndHashPassword from "./lib/password"
import { getUserFromDb } from "./lib/user"

// Reference and credit: https://authjs.dev/getting-started/authentication/credentials

export const { handlers, signIn, signOut, auth } = NextAuth({
    providers: [
      Credentials({
        credentials:{
          email:{ label: "Email", type: "email" },
          password:{ label: "Password", type:"password"}
        },
        authorize: async (credentials) => {
          try {
            let user = null

            const {email, password} = await signInSchema.parseAsync(credentials)

            // logic to salt and hash password
            const pwHash = await saltAndHashPassword(email, password)
            if (!pwHash) throw new Error("Password hashing failed.") // will remove later

            console.log("hashed password: ", pwHash)

            // logic to verify if the user exists
            user = await getUserFromDb(email, pwHash)

            if (!user) {
              // No user found, so this is their first attempt to login
              // Optionally, this is also the place you could do a user registration
              throw new Error("Invalid credentials.")
            }

            // return user object with their profile data
            return user
          } catch (error) {
            console.error("Authorization error:", error)

            if (error instanceof ZodError) {
              throw new Error("Invalid form data.")
            }

            throw error
          }
        }
      })
    ],
    debug: process.env.NODE_ENV === "development"
  })
