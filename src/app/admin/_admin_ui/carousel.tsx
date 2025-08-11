'use client'

import { baseUrls } from "@/configs";
import { usePathname } from "next/navigation";
import Header from "../../_client_ui/header";
import Link from "next/link";

export default function AdminMenu() {
    const pathname = usePathname()
    const menuLinks: {[index: string]: string} = {
        "Manage Analytics": baseUrls.ADMIN_BASE_URL,
        "Manage Payments": baseUrls.ADMIN_PAYMENTS
    }
    return (
        <div className="flex flex-row gap-2 md:gap-4">
            {["Manage Analytics", "Manage Payments"].map((menuItem, i) => {
                return (
                    <Link key={i} href={menuLinks[menuItem]}>
                            <Header key={i} text={menuItem}
                                underlined={pathname === menuLinks[menuItem]}
                            />
                    </Link>
                )
            })}
        </div>
    )
}
