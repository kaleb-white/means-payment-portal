'use server'

import { isAdmin } from "@/lib/services/admin";
import Navbar from "./navbar";

export default async function NavbarServer() {
    return (
        <Navbar isAdmin={await isAdmin()}/>
    )
}
