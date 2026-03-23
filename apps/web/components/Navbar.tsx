"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserButton, useAuth } from "@clerk/nextjs";
import { Zap, LayoutDashboard, Settings, HelpCircle, Menu, X, Search, Bell, Plus } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
    { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { label: "Settings", href: "/settings", icon: Settings },
    { label: "Help", href: "/help", icon: HelpCircle },
];

export default function Navbar() {
    const pathname = usePathname();
    const { isSignedIn } = useAuth();
    const [mobileOpen, setMobileOpen] = useState(false);

    // Don't show on landing page or dashboard pages (they have sidebar)
    const isLandingPage = pathname === "/";
    const isDashboardPage = pathname.startsWith("/dashboard") || 
                           pathname.startsWith("/database") || 
                           pathname.startsWith("/analytics") ||
                           pathname.startsWith("/teams") ||
                           pathname.startsWith("/assistant") ||
                           pathname.startsWith("/api-keys") ||
                           pathname.startsWith("/settings") ||
                           pathname.startsWith("/help");
    
    if (isLandingPage || isDashboardPage) return null;

    return (
        <>
            <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-sm border-b border-slate-100 shadow-sm">
                <div className="max-w-7xl mx-auto px-6 sm:px-8">
                    <div className="flex items-center justify-between h-16">
                        
                        {/* Logo + Nav */}
                        <div className="flex items-center gap-8">
                            <Link href="/dashboard" className="flex items-center gap-2.5 group">
                                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center group-hover:scale-110 transition-transform duration-200 shadow-md">
                                    <Zap className="w-5 h-5 text-white fill-white" />
                                </div>
                                <span className="font-bold text-slate-900 text-lg">Zap Bot</span>
                            </Link>

                            {/* Desktop Nav */}
                            <div className="hidden md:flex items-center gap-1.5">
                                {NAV_ITEMS.map((item) => {
                                    const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
                                    const isDashboardActive = item.href === "/dashboard" && (pathname === "/dashboard" || pathname === "/dashboard/");
                                    const active = isActive || isDashboardActive;
                                    
                                    return (
                                        <Link
                                            key={item.href}
                                            href={item.href}
                                            className={cn(
                                                "px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200",
                                                active 
                                                    ? "text-blue-700 bg-blue-50" 
                                                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                                            )}
                                        >
                                            {item.label}
                                        </Link>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Right Actions */}
                        <div className="flex items-center gap-3 md:gap-4">
                            {/* Search */}
                            <button className="hidden sm:flex items-center gap-2.5 px-4 py-2 text-sm text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-150 rounded-lg transition-all duration-200 font-medium">
                                <Search className="w-4 h-4" />
                                <span className="text-xs">Search</span>
                            </button>

                            {/* Notifications */}
                            <button className={cn(
                                "p-2.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-all duration-200 relative"
                            )}>
                                <Bell className="w-5 h-5" />
                                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full shadow-sm"></span>
                            </button>

                            {/* User Actions */}
                            {isSignedIn ? (
                                <>
                                    {/* Quick Action Button */}
                                    <Link 
                                        href="/dashboard/meetings"
                                        className={cn(
                                            "hidden sm:flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold",
                                            "bg-gradient-to-r from-blue-600 to-blue-700 text-white",
                                            "hover:shadow-lg hover:scale-105 active:scale-95 transition-all duration-200"
                                        )}
                                    >
                                        <Plus className="w-4 h-4" />
                                        Start Meeting
                                    </Link>
                                    <UserButton
                                        appearance={{
                                            elements: {
                                                avatarBox: "w-9 h-9 rounded-lg"
                                            }
                                        }}
                                    />
                                </>
                            ) : (
                                <Link href="/sign-in" className={cn(
                                    "px-4 py-2.5 text-sm font-semibold rounded-lg",
                                    "bg-gradient-to-r from-blue-600 to-blue-700 text-white",
                                    "hover:shadow-lg active:scale-95 transition-all duration-200"
                                )}>
                                    Sign In
                                </Link>
                            )}

                            {/* Mobile Toggle */}
                            <button
                                className="md:hidden p-2.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-all"
                                onClick={() => setMobileOpen(!mobileOpen)}
                            >
                                {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                            </button>
                        </div>
                    </div>

                    {/* Mobile Menu */}
                    {mobileOpen && (
                        <div className="md:hidden border-t border-slate-100 py-3 space-y-2">
                            {NAV_ITEMS.map((item) => {
                                const isActive = pathname === item.href || pathname.startsWith(item.href);
                                return (
                                    <Link
                                        key={item.href}
                                        href={item.href}
                                        onClick={() => setMobileOpen(false)}
                                        className={cn(
                                            "flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all",
                                            isActive 
                                                ? "text-blue-700 bg-blue-50" 
                                                : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                                        )}
                                    >
                                        <item.icon className="w-4 h-4" />
                                        {item.label}
                                    </Link>
                                );
                            })}
                        </div>
                    )}
                </div>
            </nav>

            {/* Spacer */}
            <div className="h-16" />
        </>
    );
}