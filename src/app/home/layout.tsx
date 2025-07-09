import Navbar from "../ui/navbar"

export default function HomeLayout({children}:{children: React.ReactNode}) {
    return (
        <div className="flex flex-col h-screen content-center bg-black">
            <Navbar />
            {children}
        </div>
    )
}
