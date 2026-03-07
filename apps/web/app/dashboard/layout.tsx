"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    LayoutDashboard,
    Puzzle,
    Settings,
    Sparkles,
    Video,
    MessageSquare,
} from "lucide-react";
import "./dashboard.css";

const NAV_ITEMS = [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/dashboard/chat", label: "Chat", icon: MessageSquare, badge: "AI" },
    { href: "/agent", label: "Zap Agent", icon: Sparkles },
    { href: "/meetings/mtg-001", label: "Meetings", icon: Video },
    { href: "/extension", label: "Extension", icon: Puzzle },
    { href: "/settings", label: "Settings", icon: Settings },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();

    return (
        <div className="dashLayout">
            <aside className="sidebar">
                <div className="sidebarBrand">
                    <div className="sidebarLogo">Z</div>
                    <div>
                        <div className="sidebarBrandName">Zap Bot</div>
                        <div className="sidebarBrandSub">Meeting OS</div>
                    </div>
                </div>

                <nav className="sidebarNav">
                    <div className="navSection">Workspace</div>
                    {NAV_ITEMS.map((item) => {
                        const Icon = item.icon;
                        const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));

                        return (
                            <Link
                                key={`${item.href}-${item.label}`}
                                href={item.href}
                                className={`sidebarLink${isActive ? " active" : ""}`}
                            >
                                <span className="navIcon"><Icon size={16} /></span>
                                {item.label}
                                {item.badge ? <span className="navBadge">{item.badge}</span> : null}
                            </Link>
                        );
                    })}
                </nav>

                <div className="sidebarFooter">
                    <div className="sidebarAvatar">DU</div>
                    <div>
                        <div className="sidebarUserName">Demo User</div>
                        <div className="sidebarUserPlan">Growth Plan</div>
                    </div>
                </div>
            </aside>

            <main className="mainContent">{children}</main>
        </div>
    );
}
