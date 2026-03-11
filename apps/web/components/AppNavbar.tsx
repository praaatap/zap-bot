"use client";

import { usePathname } from "next/navigation";
import Navbar from "@/components/Navbar";

const HIDDEN_PREFIXES = ["/sign-in", "/sign-up"];

export default function AppNavbar() {
    const pathname = usePathname();
    const shouldHide = HIDDEN_PREFIXES.some((prefix) => pathname.startsWith(prefix));

    if (shouldHide) {
        return null;
    }

    return <Navbar />;
}
