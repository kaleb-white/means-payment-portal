import { SupabaseAnayticsService } from "../supabase/anayltics_service_impl";
import { SupabaseAuthService } from "../supabase/auth_service_impl";
import { AuthServices, AnalyticsServices } from "./interfaces";

let authService: AuthServices | null = null
let analyticsService: AnalyticsServices | null = null

export const DatabaseContext = () => {
    if (!authService) {
        authService = new SupabaseAuthService()
    }

    if (!analyticsService) {
        analyticsService = new SupabaseAnayticsService()
    }

    return {
        authService,
        analyticsService
    }

}
