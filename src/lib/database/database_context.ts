'use server'

import { SupabaseAnayticsService } from "../services/supabase/service_implementations/anayltics_service_impl";
import { SupabaseAuthService } from "../services/supabase/service_implementations/auth_service_impl";
import { SupabaseUserService } from "../services/supabase/service_implementations/user_service_impl";
import { SupabaseAdminService } from "../services/supabase/service_implementations/admin_service_impl";

const DatabaseContext = async () => {
    // Why not just export the services? Why reassign them?
    //  If db provider changes, then this is the main point of connection, other than the middleware
    //  So if these all change, no changes need to be made in client code or server action calls because the provider name is changed
    class authService extends SupabaseAuthService {
        static signUp = SupabaseAuthService.signUp
        static signIn = SupabaseAuthService.signIn
        static signOut = SupabaseAuthService.signOut
        static getCurrentUser = SupabaseAuthService.getCurrentUser
    }
    class analyticsService extends SupabaseAnayticsService {
        static getUserQuarterlyReports = SupabaseAnayticsService.getUserQuarterlyReports
        static getUserInProgressReport = SupabaseAnayticsService.getUserInProgressReport
    }
    class userService extends SupabaseUserService {
        static getUserById = SupabaseUserService.getUserById
        static updateUser = SupabaseUserService.updateUser
        static deleteUser = SupabaseUserService.deleteUser
        static getUserCouponByUser = SupabaseUserService.getUserCouponByUser
    }
    class adminService extends SupabaseAdminService {
        static isUserAdmin = SupabaseAdminService.isUserAdmin
    }

    return {
        authService,
        analyticsService,
        userService,
        adminService
    }

}

export default DatabaseContext
