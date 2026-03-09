"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useUser, UserButton } from "@clerk/nextjs";
import { ChevronDown, Database } from "lucide-react";

export default function DashboardTopNav() {
    const pathname = usePathname();
    const { user } = useUser();

    const currentSection = pathname
        .replace("/dashboard", "")
        .split("/")
        .filter(Boolean)[0] || "dashboard";

    const sectionLabel = currentSection.charAt(0).toUpperCase() + currentSection.slice(1);
    const orgLabel = user?.firstName ? `${user.firstName}'s Org` : "Workspace Org";

    return (
        <div className="h-14 border-b border-slate-200 bg-white sticky top-0 z-40 flex items-center justify-between px-6">
            {/* Left: Breadcrumb Navigation */}
            <div className="flex items-center gap-3">
                {/* Organization Selector */}
                <button className="flex items-center gap-2 px-3 py-1.5 hover:bg-slate-50 rounded-md transition-colors">
                    <span className="text-sm font-medium text-slate-900">{orgLabel}</span>
                    <ChevronDown className="w-4 h-4 text-slate-500" />
                </button>

                <span className="text-slate-300">/</span>

                {/* Project Selector */}
                <button className="flex items-center gap-2 px-3 py-1.5 hover:bg-slate-50 rounded-md transition-colors">
                    <span className="text-sm font-medium text-slate-900">Default</span>
                    <ChevronDown className="w-4 h-4 text-slate-500" />
                </button>

                <span className="text-slate-300">/</span>

                {/* Current Page */}
                <div className="flex items-center gap-2 px-3 py-1.5">
                    <Database className="w-4 h-4 text-slate-600" />
                    <span className="text-sm font-medium text-slate-600">{sectionLabel}</span>
                </div>
            </div>

            {/* Right: Actions */}
            <div className="flex items-center gap-4">
                <Link 
                    href="/dashboard/docs" 
                    className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors"
                >
                    Docs
                </Link>
                <Link 
                    href="/dashboard/settings" 
                    className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors"
                >
                    Settings
                </Link>
                <Link 
                    href="/dashboard/help" 
                    className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors"
                >
                    Get help
                </Link>
                
                <div className="h-6 w-px bg-slate-200"></div>
                
                {/* User Avatar */}
                <UserButton
                    appearance={{
                        elements: {
                            avatarBox: "w-8 h-8"
                        }
                    }}
                />
            </div>
        </div>
    );
}
