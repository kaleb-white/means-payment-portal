import { getUser } from "@/lib/user/user"

export default async function Analytics() {

    const user = await getUser()

    return (
        <div className="flex flex-col">
            <p>hello {user.email}</p>
        </div>
    )
}
