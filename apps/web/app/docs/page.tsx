import Link from "next/link";
import {
    ArrowRight,
    BookOpen,
    Calendar,
    CircleHelp,
    FileText,
    FolderOpen,
    LayoutDashboard,
    LifeBuoy,
    Settings,
    Video,
} from "lucide-react";

type LinkItem = {
    title: string;
    description: string;
    href: string;
    icon: React.ComponentType<{ className?: string }>;
};

const workspaceLinks: LinkItem[] = [
    {
        title: "Settings",
        description: "Manage bot behavior, notifications, and preferences.",
        href: "/dashboard/settings",
        icon: Settings,
    },
    {
        title: "Get Help",
        description: "Search FAQs, contact support, and view tutorials.",
        href: "/dashboard/help",
        icon: LifeBuoy,
    },
    {
        title: "Calendar",
        description: "Connect Google Calendar and review upcoming meetings.",
        href: "/dashboard/calendar",
        icon: Calendar,
    },
];

const docsLinks: LinkItem[] = [
    {
        title: "Dashboard Overview",
        description: "Understand metrics, cards, and meeting activity views.",
        href: "/dashboard",
        icon: LayoutDashboard,
    },
    {
        title: "Meetings",
        description: "Join meetings and monitor active sessions.",
        href: "/dashboard/meetings",
        icon: Video,
    },
    {
        title: "Recordings",
        description: "Access completed recordings and transcripts.",
        href: "/dashboard/recordings",
        icon: FolderOpen,
    },
    {
        title: "History",
        description: "Browse previous meetings and AI summaries.",
        href: "/dashboard/history",
        icon: FileText,
    },
    {
        title: "Help Center",
        description: "Troubleshooting and support knowledge base.",
        href: "/dashboard/help",
        icon: CircleHelp,
    },
    {
        title: "Full Docs",
        description: "Product guides and reference documentation.",
        href: "/docs",
        icon: BookOpen,
    },
];

function DocCard({ item }: { item: LinkItem }) {
    return (
        <Link
            href={item.href}
            className="group rounded-2xl border border-slate-200 bg-white p-5 transition-all duration-150 ease-out hover:border-slate-300 hover:shadow-sm"
        >
            <div className="mb-4 flex items-center gap-3">
                <div className="rounded-lg bg-slate-100 p-2 text-slate-700">
                    <item.icon className="h-4 w-4" />
                </div>
                <h3 className="text-sm font-semibold text-slate-900">{item.title}</h3>
            </div>
            <p className="mb-5 text-sm text-slate-600">{item.description}</p>
            <span className="inline-flex items-center gap-1 text-sm font-medium text-slate-700 group-hover:text-slate-900">
                Open
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </span>
        </Link>
    );
}

export default function DocsPage() {
    return (
        <div className="min-h-screen bg-slate-50 px-6 py-10 md:px-8">
            <div className="mx-auto max-w-6xl space-y-10">
                <section className="rounded-3xl border border-slate-200 bg-white p-8">
                    <h1 className="text-3xl font-bold text-slate-900">Zap Bot Docs</h1>
                    <p className="mt-2 max-w-2xl text-slate-600">
                        Central place for navigation and guides. Settings and support links are available here so your sidebar stays focused on meeting workflow.
                    </p>
                </section>

                <section>
                    <div className="mb-4 flex items-center justify-between">
                        <h2 className="text-lg font-semibold text-slate-900">Workspace Links</h2>
                        <span className="text-xs font-medium uppercase tracking-wider text-slate-500">Quick Access</span>
                    </div>
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                        {workspaceLinks.map((item) => (
                            <DocCard key={item.title} item={item} />
                        ))}
                    </div>
                </section>

                <section>
                    <div className="mb-4 flex items-center justify-between">
                        <h2 className="text-lg font-semibold text-slate-900">Product Guides</h2>
                        <span className="text-xs font-medium uppercase tracking-wider text-slate-500">Documentation</span>
                    </div>
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {docsLinks.map((item) => (
                            <DocCard key={item.title} item={item} />
                        ))}
                    </div>
                </section>
            </div>
        </div>
    );
}
