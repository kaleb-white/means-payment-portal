export interface User { // Modeled on (a partial of) supabase user obj: https://supabase.com/docs/guides/auth/users
    id: string // Unique User ID (UUID)
    aud: string // The 'audience claim', JWT token describing access service or addres
    role: string // For Row Level Security (RLS) checks
    email: string // The user's email address
    confirmed_at: string // Timestamp the user confirmed their email at
    last_sign_in_at: string // Timestamp since user last signed in
    created_at: string // Timestamp user was created at
    updated_at: string // Timestamps user was updated at
}

export interface UserServices {
    getUserById(id: string): Promise<User | null>
    updateUser(id: string, updates: Partial<User>): Promise<User>
    deleteUser(id: string): Promise<void>
}

export interface AuthServices {
    // Does not return the user because their session should be set going forward
    signUp(email: string, password: string): Promise<Error | null>
    // Does not return the user because their session should be set going forward
    signIn(email: string, password: string): Promise<Error | null>
    signOut(): Promise<void>
    getCurrentUser(): Promise<{user: User | null,  error: Error | null}>
}

export interface AnalyticsServices {
    getUserQuarterlyReports(user: User, quarters: number): Promise<null>
}
