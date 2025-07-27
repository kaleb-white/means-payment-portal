"use server"

import { DatabaseContext } from "./database/database_context"

export async function isAdmin(): Promise<boolean> {
    const dbContext = await DatabaseContext()
    return dbContext.adminService.isUserAdmin()
}
