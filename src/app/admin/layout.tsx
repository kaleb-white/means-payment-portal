import NavbarServer from "../_client_ui/navbar_server"
import AdminMenu from "./carousel"

export default function AdminLayout({children}:{children: React.ReactNode}) {
    return (
        <div className="flex flex-col h-screen content-center bg-black">
            <NavbarServer />
            <div className="flex flex-col p-4">
                <AdminMenu />
                <div className="means-border my-4 p-4">
                    {children}
                </div>
            </div>
        </div>
    )
}
