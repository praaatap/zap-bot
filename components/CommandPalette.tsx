"use client";

import React, { useEffect, useState } from "react";
import { Command } from "cmdk";
import { Search, Calendar, MessageSquare, BarChart, Settings, Bot, ChevronRight, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { cn } from "@/lib/utils";

interface SearchResult {
    id: string;
    type: "meeting" | "action" | "nav";
    title: string;
    subtitle?: string;
    href: string;
    icon: any;
}

export default function CommandPalette({
    open,
    setOpen,
}: {
    open: boolean;
    setOpen: (open: boolean) => void;
}) {
    const router = useRouter();
    const { user } = useUser();
    const [search, setSearch] = useState("");
    const [results, setResults] = useState<SearchResult[]>([]);
    const [isSearching, setIsSearching] = useState(false);

    // Initial navigation items
    const navItems: SearchResult[] = [
        { id: "nav-dash", type: "nav", title: "Go to Dashboard", href: "/dashboard", icon: Search },
        { id: "nav-meet", type: "nav", title: "View All Meetings", href: "/dashboard/meetings", icon: Calendar },
        { id: "nav-chat", type: "nav", title: "Open AI Chat", href: "/dashboard/chat", icon: MessageSquare },
        { id: "nav-anal", type: "nav", title: "View Analytics", href: "/dashboard/analytics", icon: BarChart },
        { id: "nav-sett", type: "nav", title: "Settings", href: "/dashboard/settings", icon: Settings },
    ];

    useEffect(() => {
        const down = (e: KeyboardEvent) => {
            if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                setOpen(true);
            }
        };

        document.addEventListener("keydown", down);
        return () => document.removeEventListener("keydown", down);
    }, [setOpen]);

    useEffect(() => {
        if (!search) {
            setResults([]);
            return;
        }

        const debounce = setTimeout(async () => {
            setIsSearching(true);
            try {
                const res = await fetch(`/api/search/global?q=${encodeURIComponent(search)}`);
                if (res.ok) {
                    const data = await res.json();
                    setResults(data.results);
                }
            } catch (err) {
                console.error("Search error:", err);
            } finally {
                setIsSearching(false);
            }
        }, 300);

        return () => clearTimeout(debounce);
    }, [search]);

    const handleSelect = (href: string) => {
        setOpen(false);
        router.push(href);
    };

    if (!open) return null;

    return (
        <Command.Dialog
            open={open}
            onOpenChange={setOpen}
            label="Global Command Menu"
            className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh] px-4 font-sans"
        >
            <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200" onClick={() => setOpen(false)} />
            
            <div className="relative w-full max-w-xl overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_32px_128px_-16px_rgba(0,0,0,0.15)] animate-in zoom-in-95 duration-200">
                <div className="flex items-center border-b border-slate-100 px-4">
                    <Search className="h-5 w-5 text-slate-400" />
                    <Command.Input
                        autoFocus
                        placeholder="Search meetings, ask AI, or navigate..."
                        onValueChange={setSearch}
                        className="h-14 w-full border-none bg-transparent px-3 text-[15px] text-slate-900 outline-none placeholder:text-slate-400"
                    />
                    <div className="flex items-center gap-1.5 rounded-md bg-slate-100 px-1.5 py-0.5 text-[10px] font-bold text-slate-500">
                        <span className="text-[12px]">ESC</span>
                    </div>
                </div>

                <Command.List className="custom-scrollbar max-h-[400px] overflow-y-auto p-2">
                    {isSearching && (
                        <div className="flex items-center justify-center py-10 text-sm text-slate-400">
                            <Bot className="mr-2 h-4 w-4 animate-bounce" />
                            Searching your workspace...
                        </div>
                    )}

                    <Command.Empty className="flex h-20 items-center justify-center text-sm text-slate-400">
                        No results found.
                    </Command.Empty>

                    {!search && (
                        <Command.Group heading="Navigation" className="px-2 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                            {navItems.map((item) => (
                                <Item key={item.id} item={item} onSelect={() => handleSelect(item.href)} />
                            ))}
                        </Command.Group>
                    )}

                    {results.length > 0 && (
                        <Command.Group heading="Search Results" className="px-2 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                            {results.map((item) => (
                                <Item key={item.id} item={item} onSelect={() => handleSelect(item.href)} />
                            ))}
                        </Command.Group>
                    )}
                    
                    {search && !isSearching && (
                        <Command.Group heading="AI Actions" className="px-2 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                            <Command.Item
                                onSelect={() => handleSelect(`/dashboard/chat?q=${encodeURIComponent(search)}`)}
                                className="flex cursor-pointer items-center justify-between rounded-xl px-3 py-3 transition-all aria-selected:bg-blue-50 aria-selected:text-blue-700"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-100/50 text-blue-600">
                                        <Bot size={18} strokeWidth={2.2} />
                                    </div>
                                    <div>
                                        <p className="text-[14px] font-semibold">Ask AI about "{search}"</p>
                                        <p className="text-[11px] text-slate-400">Search across all meeting transcripts with AI</p>
                                    </div>
                                </div>
                                < ChevronRight size={14} className="text-slate-300" />
                            </Command.Item>
                        </Command.Group>
                    )}
                </Command.List>

                <div className="flex items-center justify-between border-t border-slate-100 bg-slate-50/50 px-4 py-2 text-[10px] text-slate-400">
                    <div className="flex items-center gap-4">
                        <span className="flex items-center gap-1"><span className="rounded border border-slate-200 bg-white px-1 font-mono">↑↓</span> to navigate</span>
                        <span className="flex items-center gap-1"><span className="rounded border border-slate-200 bg-white px-1 font-mono">↵</span> to select</span>
                    </div>
                    <span className="font-medium text-slate-500">ZapBot Global Search</span>
                </div>
            </div>
        </Command.Dialog>
    );
}

const ICON_MAP: Record<string, any> = {
    Calendar,
    MessageSquare,
    Search,
    Settings,
    BarChart,
    Bot
};

function Item({ item, onSelect }: { item: SearchResult; onSelect: () => void }) {
    const Icon = typeof item.icon === "string" ? ICON_MAP[item.icon] || Search : item.icon;
    return (
        <Command.Item
            onSelect={onSelect}
            className="group flex cursor-pointer items-center justify-between rounded-xl px-3 py-2.5 transition-all aria-selected:bg-blue-50 aria-selected:text-blue-700"
        >
            <div className="flex items-center gap-3">
                <div className={cn(
                    "flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-700 transition-colors",
                    "group-aria-selected:border-blue-200 group-aria-selected:bg-blue-100/50 group-aria-selected:text-blue-600"
                )}>
                    <Icon size={17} strokeWidth={2.2} />
                </div>
                <div>
                    <p className="text-[14px] font-semibold leading-none">{item.title}</p>
                    {item.subtitle && <p className="mt-1.5 text-[11px] text-slate-400 group-aria-selected:text-blue-500/70">{item.subtitle}</p>}
                </div>
            </div>
            <ChevronRight size={14} className="text-slate-300 opacity-0 group-aria-selected:opacity-100" />
        </Command.Item>
    );
}
