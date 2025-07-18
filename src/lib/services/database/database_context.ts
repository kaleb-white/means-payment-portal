'use server'

import { SupabaseAnayticsService } from "../supabase/anayltics_service_impl";
import { SupabaseAuthService } from "../supabase/auth_service_impl";
import SupabaseUserService from "../supabase/user_service_impl";
import { AuthServices, AnalyticsServices, UserServices } from "./interfaces";

let authService: AuthServices | null = null
let analyticsService: AnalyticsServices | null = null
let userService: UserServices | null = null

export const DatabaseContext = async () => {
    if (!authService) {
        authService = new SupabaseAuthService()
    }

    if (!analyticsService) {
        analyticsService = new SupabaseAnayticsService()
    }

    if (!userService) {
        userService = new SupabaseUserService()
    }

    return {
        authService,
        analyticsService,
        userService
    }

}
