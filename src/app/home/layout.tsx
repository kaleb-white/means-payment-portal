import NavbarServer from "../_client_ui/navbar_server"

export default function HomeLayout({children}:{children: React.ReactNode}) {
    return (
        <div className="flex flex-col h-screen content-center bg-black">
            <NavbarServer />
            {children}
        </div>
    )
}
