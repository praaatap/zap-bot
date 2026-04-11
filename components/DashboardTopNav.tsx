"use client";

import { useEffect, useState } from "react";
import { CustomUserButton } from "./auth/CustomUserButton";
import { Bell, Search, Command, Share2 } from "lucide-react";
import { cn } from "@/lib/utils";
import CommandPalette from "./CommandPalette";

export default function DashboardTopNav({ leftOffset = 0 }: { leftOffset?: number }) {
    const [isPaletteOpen, setIsPaletteOpen] = useState(false);

    return (
        <header
            className={cn(
                "fixed top-0 right-0 z-40 flex h-20 items-center border-b border-[#e5e7eb] bg-[#f8fafc] px-5 transition-all duration-300 md:px-6",
            )}
            style={{ left: `${leftOffset}px` }}
        >
            <CommandPalette open={isPaletteOpen} setOpen={setIsPaletteOpen} />
            
            <div className="flex w-full items-center gap-4">
                <div className="hidden items-center gap-2 text-[15px] font-medium text-[#6b7280] lg:flex">
                    <span>Main Menu</span>
                    <span className="mx-1">›</span>
                    <span className="font-semibold text-[#111827]">Dashboard</span>
                </div>

                <div className="relative ml-auto flex w-full max-w-220 items-center gap-3">
                    <div className="relative flex-1 group">
                        <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#6b7280] group-focus-within:text-blue-500 transition-colors" strokeWidth={2.2} />
                        <input
                            onFocus={(e) => {
                                e.target.blur();
                                setIsPaletteOpen(true);
                            }}
                            placeholder="Search (Ctrl + K)"
                                className="h-12 w-full cursor-pointer rounded-lg border border-[#e5e7eb] bg-white pl-12 pr-14 text-sm font-medium text-[#111827] outline-none placeholder:text-[#9ca3af] hover:border-[#d1d5db] transition-all"
                        />
                        <div className="absolute right-3 top-1/2 hidden -translate-y-1/2 items-center gap-1.5 rounded-md border border-slate-200 bg-slate-50 px-1.5 py-0.5 text-[10px] font-bold text-[#6b7280] sm:flex">
                            <Command size={11} strokeWidth={2.5} />
                            <span>K</span>
                        </div>
                    </div>

                    <button className="relative flex h-12 w-12 items-center justify-center rounded-lg border border-[#e5e7eb] bg-white text-[#4b5563] hover:bg-[#f9fafb] transition-colors">
                        <Bell className="h-5 w-5" strokeWidth={2.2} />
                        <span className="absolute right-3.5 top-3.5 h-2 w-2 rounded-full border-2 border-white bg-red-500" />
                    </button>

                    <button className="flex h-12 w-12 items-center justify-center rounded-lg border border-[#e5e7eb] bg-white text-[#4b5563] hover:bg-[#f9fafb]">
                        <Share2 className="h-5 w-5" strokeWidth={2.2} />
                    </button>

                    <div className="relative">
                        <CustomUserButton />
                    </div>
                </div>
            </div>
        </header>
    );
}