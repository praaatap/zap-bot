"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useUser, UserButton } from "@clerk/nextjs";
import { Bell, CircleHelp, Search } from "lucide-react";

const SEARCH_ITEMS = [
    { label: "Dashboard", href: "/dashboard" },
    { label: "Meetings", href: "/dashboard/meetings" },
    { label: "Recordings", href: "/dashboard/recordings" },
    { label: "Calendar", href: "/dashboard/calendar" },
    { label: "Upcoming", href: "/dashboard/upcoming" },
    { label: "History", href: "/dashboard/history" },
    { label: "Docs", href: "/dashboard/docs" },
    { label: "Settings", href: "/dashboard/settings" },
    { label: "Help", href: "/dashboard/help" },
];

type DashboardTopNavProps = {
    leftOffset?: number;
};

export default function DashboardTopNav({ leftOffset = 0 }: DashboardTopNavProps) {
    const router = useRouter();
    const pathname = usePathname();
    const { user } = useUser();
    const [query, setQuery] = useState("");
    const [isFocused, setIsFocused] = useState(false);

    const profileName = [user?.firstName, user?.lastName].filter(Boolean).join(" ") || "John Doe";

    const matches = useMemo(() => {
        const cleaned = query.trim().toLowerCase();
        if (!cleaned) return SEARCH_ITEMS.slice(0, 5);
        return SEARCH_ITEMS.filter((item) => item.label.toLowerCase().includes(cleaned)).slice(0, 5);
    }, [query]);

    function handleNavigate(href: string) {
        setQuery("");
        setIsFocused(false);
        router.push(href);
    }

    function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        const firstMatch = matches[0];
        if (firstMatch) {
            handleNavigate(firstMatch.href);
        }
    }

    return (
        <div
            className="fixed right-0 top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur supports-backdrop-filter:bg-white/85"
            style={{ left: `${leftOffset}px` }}
        >
            <div className="flex h-16 items-center justify-between gap-3 px-4 md:px-6">
                <div className="flex min-w-0 flex-1 items-center gap-3 md:max-w-md md:gap-4">
                    <form onSubmit={handleSubmit} className="relative min-w-0 flex-1">
                        <label className="flex min-w-0 items-center gap-2 rounded-md border border-slate-200 bg-slate-50 px-3 py-2 shadow-[0_1px_0_rgba(15,23,42,0.02)]">
                            <Search className="h-4 w-4 text-slate-400" />
                            <input
                                value={query}
                                onFocus={() => setIsFocused(true)}
                                onBlur={() => {
                                    window.setTimeout(() => setIsFocused(false), 120);
                                }}
                                onChange={(event) => setQuery(event.target.value)}
                                className="w-full bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-400"
                                placeholder="Search dashboard tabs"
                                aria-label="Search"
                            />
                        </label>

                        {isFocused && matches.length > 0 && (
                            <div className="absolute left-0 right-0 top-11 z-50 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-lg">
                                {matches.map((item) => (
                                    <button
                                        key={item.href}
                                        type="button"
                                        onMouseDown={() => handleNavigate(item.href)}
                                        className="flex w-full items-center justify-between px-3 py-2 text-left text-sm text-slate-600 transition-colors hover:bg-slate-50 hover:text-slate-900"
                                    >
                                        <span>{item.label}</span>
                                        <span className="text-xs text-slate-400">{item.href.replace("/dashboard", "") || "/"}</span>
                                    </button>
                                ))}
                            </div>
                        )}
                    </form>
                </div>

                <div className="hidden items-center justify-center md:flex">
                    <div className="grid h-11 w-11 grid-cols-2 gap-0.5 overflow-hidden rounded-lg border border-slate-200 bg-white p-1 shadow-sm">
                        <span className="rounded-sm bg-[#4285f4]" />
                        <span className="rounded-sm bg-[#34a853]" />
                        <span className="rounded-sm bg-[#fbbc05]" />
                        <span className="rounded-sm bg-[#ea4335]" />
                    </div>
                </div>

                <div className="flex items-center gap-2 md:gap-3">
                    <div className="hidden rounded-lg border border-slate-200 bg-[#f7f4ff] px-3 py-1.5 text-sm lg:block">
                        <span className="font-bold text-indigo-700">865</span>
                        <span className="ml-1 text-slate-600">/1200hrs</span>
                        <span className="ml-2 text-slate-500">Remaining hrs</span>
                    </div>

                    <button className="grid h-9 w-9 place-items-center rounded-full border border-slate-200 text-slate-500 transition-colors hover:border-slate-300 hover:text-slate-800" aria-label="Help">
                        <CircleHelp className="h-4 w-4" />
                    </button>

                    <button className="grid h-9 w-9 place-items-center rounded-full border border-slate-200 text-slate-500 transition-colors hover:border-slate-300 hover:text-slate-800" aria-label="Notifications">
                        <Bell className="h-4 w-4" />
                    </button>

                    <div className="hidden items-center gap-4 text-sm font-medium text-slate-600 xl:flex">
                        <Link href="/dashboard/docs" className={pathname === "/dashboard/docs" ? "text-slate-900" : "hover:text-slate-900"}>Docs</Link>
                        <Link href="/dashboard/settings" className={pathname === "/dashboard/settings" ? "text-slate-900" : "hover:text-slate-900"}>Settings</Link>
                        <Link href="/dashboard/help" className={pathname === "/dashboard/help" ? "text-slate-900" : "hover:text-slate-900"}>Help</Link>
                    </div>

                    <div className="h-6 w-px bg-slate-200" />

                    <div className="flex items-center gap-2">
                        <UserButton
                            appearance={{
                                elements: {
                                    avatarBox: "w-8 h-8"
                                }
                            }}
                        />
                        <div className="hidden leading-tight md:block">
                            <p className="text-xs font-semibold text-slate-900">{profileName}</p>
                            <p className="text-[11px] text-slate-500">Admin</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
