"use client";

import { useState } from "react";
import { UserButton } from "@clerk/nextjs";
import { Bell, Search, Command, Share2 } from "lucide-react";
import { cn } from "@/lib/utils";

export default function DashboardTopNav({ leftOffset = 0 }: { leftOffset?: number }) {
    const [query, setQuery] = useState("");

    return (
        <header
            className={cn(
                "fixed top-0 right-0 z-40 flex h-20 items-center border-b border-[#e5e7eb] bg-[#f8fafc] px-5 transition-all duration-300 md:px-6",
            )}
            style={{ left: `${leftOffset}px` }}
        >
            <div className="flex w-full items-center gap-4">
                <div className="hidden items-center gap-2 text-[15px] font-medium text-[#6b7280] lg:flex">
                    <span>Main Menu</span>
                    <span className="mx-1">›</span>
                    <span className="font-semibold text-[#111827]">Dashboard</span>
                </div>

                <div className="relative ml-auto flex w-full max-w-220 items-center gap-3">
                    <div className="relative flex-1">
                        <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#6b7280]" strokeWidth={2.2} />
                        <input
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder="Search"
                            className="h-12 w-full rounded-lg border border-[#e5e7eb] bg-white pl-12 pr-14 text-sm font-medium text-[#111827] outline-none placeholder:text-[#9ca3af] focus:border-[#d1d5db]"
                        />
                        <div className="absolute right-3 top-1/2 hidden -translate-y-1/2 items-center gap-1 text-[11px] font-semibold text-[#6b7280] sm:flex">
                            <Command size={13} strokeWidth={2.2} />
                        </div>
                    </div>

                    <button className="relative flex h-12 w-12 items-center justify-center rounded-lg border border-[#e5e7eb] bg-white text-[#4b5563] hover:bg-[#f9fafb]">
                        <Bell className="h-5 w-5" strokeWidth={2.2} />
                        <span className="absolute right-3 top-3 h-2.5 w-2.5 rounded-full bg-red-500" />
                    </button>

                    <button className="flex h-12 w-12 items-center justify-center rounded-lg border border-[#e5e7eb] bg-white text-[#4b5563] hover:bg-[#f9fafb]">
                        <Share2 className="h-5 w-5" strokeWidth={2.2} />
                    </button>

                    <div className="relative">
                        <UserButton
                            appearance={{
                                elements: {
                                    avatarBox: "h-12 w-12 rounded-full ring-2 ring-white shadow-md",
                                    userButtonPopoverCard: "rounded-2xl border border-[#e5e7eb] shadow-[0_24px_48px_rgba(15,23,42,0.1)]",
                                },
                            }}
                        />
                    </div>
                </div>
            </div>
        </header>
    );
}