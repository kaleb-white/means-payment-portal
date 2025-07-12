import { DatabaseContext } from "@/lib/services/database/database_context"

export default async function Analytics() {

    const user = await DatabaseContext().authService.getCurrentUser()

    //const analyticsData = await DatabaseContext().analyticsService.getUserQuarterlyReports(user, 1)

    return (
        <div className="flex flex-col">
            {user?.email}
        </div>
    )
}
