import { getCurrentUser } from "@/lib/services/user"

export default async function Analytics() {

    const user = await getCurrentUser()

    return (
        <div className="flex flex-col">
            <p>hello {user.email}</p>
        </div>
    )
}
