import Link from "next/link";
import { ArrowRight, BookOpen, Calendar, LifeBuoy, Settings } from "lucide-react";

const links = [
    {
        title: "Settings",
        description: "Manage notifications, bot behavior, and workspace preferences.",
        href: "/dashboard/settings",
        icon: Settings,
    },
    {
        title: "Help",
        description: "Open support resources, FAQs, and troubleshooting guides.",
        href: "/dashboard/help",
        icon: LifeBuoy,
    },
    {
        title: "Calendar",
        description: "Review events and Google Calendar connection status.",
        href: "/dashboard/calendar",
        icon: Calendar,
    },
    {
        title: "Full Documentation",
        description: "Open the full docs experience with guides and references.",
        href: "/docs",
        icon: BookOpen,
    },
];

export default function DashboardDocsPage() {
    return (
        <div className="min-h-screen px-4 py-5 md:px-6">
            <div className="mx-auto max-w-350 space-y-5">
                <div className="animate-fade-in rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900">Docs</h1>
                    <p className="mt-1 text-sm text-slate-500">Quick documentation links inside dashboard layout.</p>
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    {links.map((item, idx) => (
                        <Link
                            key={item.title}
                            href={item.href}
                            className="animate-fade-in group rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md"
                            style={{ animationDelay: `${idx * 70}ms` }}
                        >
                            <div className="mb-3 flex items-center gap-3">
                                <div className="rounded-lg bg-slate-100 p-2 text-slate-700">
                                    <item.icon className="h-4 w-4" />
                                </div>
                                <h2 className="text-base font-semibold text-slate-900">{item.title}</h2>
                            </div>
                            <p className="mb-4 text-sm text-slate-600">{item.description}</p>
                            <span className="inline-flex items-center gap-1 text-sm font-medium text-slate-700 group-hover:text-slate-900">
                                Open
                                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                            </span>
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    );
}
