"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserButton, useAuth } from "@clerk/nextjs";
import { Zap, LayoutDashboard, Settings, HelpCircle, Menu, X, Search, Bell } from "lucide-react";
import { useState } from "react";

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
            <nav className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-slate-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6">
                    <div className="flex items-center justify-between h-14">
                        
                        {/* Logo + Nav */}
                        <div className="flex items-center gap-6">
                            <Link href="/dashboard" className="flex items-center gap-2 group">
                                <div className="w-7 h-7 rounded-lg bg-slate-900 flex items-center justify-center group-hover:scale-105 transition-transform">
                                    <Zap className="w-4 h-4 text-white fill-white" />
                                </div>
                                <span className="font-semibold text-slate-900">Zap Bot</span>
                            </Link>

                            {/* Desktop Nav */}
                            <div className="hidden md:flex items-center gap-1">
                                {NAV_ITEMS.map((item) => {
                                    const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
                                    const isDashboardActive = item.href === "/dashboard" && (pathname === "/dashboard" || pathname === "/dashboard/");
                                    const active = isActive || isDashboardActive;
                                    
                                    return (
                                        <Link
                                            key={item.href}
                                            href={item.href}
                                            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                                                active 
                                                    ? "text-slate-900 bg-slate-100" 
                                                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                                            }`}
                                        >
                                            {item.label}
                                        </Link>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Right Actions */}
                        <div className="flex items-center gap-2">
                            {/* Search */}
                            <button className="hidden sm:flex items-center gap-2 px-3 py-1.5 text-sm text-slate-500 hover:text-slate-700 bg-slate-50 hover:bg-slate-100 rounded-md transition-colors">
                                <Search className="w-4 h-4" />
                                <span className="text-xs">Search</span>
                            </button>

                            {/* Notifications */}
                            <button className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-md transition-colors relative">
                                <Bell className="w-4 h-4" />
                                <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-blue-500 rounded-full"></span>
                            </button>

                            {/* User */}
                            {isSignedIn ? (
                                <UserButton
                                    appearance={{
                                        elements: {
                                            avatarBox: "w-7 h-7"
                                        }
                                    }}
                                />
                            ) : (
                                <Link href="/sign-in" className="px-3 py-1.5 text-sm font-medium bg-slate-900 text-white hover:bg-slate-800 rounded-md transition-colors">
                                    Sign In
                                </Link>
                            )}

                            {/* Mobile Toggle */}
                            <button
                                className="md:hidden p-2 text-slate-600 hover:text-slate-900 rounded-md"
                                onClick={() => setMobileOpen(!mobileOpen)}
                            >
                                {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                            </button>
                        </div>
                    </div>

                    {/* Mobile Menu */}
                    {mobileOpen && (
                        <div className="md:hidden border-t border-slate-200 py-2">
                            {NAV_ITEMS.map((item) => {
                                const isActive = pathname === item.href || pathname.startsWith(item.href);
                                return (
                                    <Link
                                        key={item.href}
                                        href={item.href}
                                        onClick={() => setMobileOpen(false)}
                                        className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                                            isActive 
                                                ? "text-slate-900 bg-slate-100" 
                                                : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                                        }`}
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
            <div className="h-14" />
        </>
    );
}