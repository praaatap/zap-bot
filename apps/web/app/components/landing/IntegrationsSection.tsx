"use client";

const integrations = [
    { name: "Slack", icon: "https://cdn.worldvectorlogo.com/logos/slack-new-logo.svg" },
    { name: "Google Calendar", icon: "https://www.gstatic.com/images/branding/product/1x/calendar_2020q4_48dp.png" },
    { name: "Zoom", icon: "https://st1.zoom.us/static/6.3.26296/image/new/ZoomLogo.png" },
    { name: "Microsoft Teams", icon: "https://upload.wikimedia.org/wikipedia/commons/c/c9/Microsoft_Office_Teams_%282018%E2%80%93present%29.svg" },
    { name: "Jira", icon: "https://cdn.worldvectorlogo.com/logos/jira-1.svg" },
    { name: "Trello", icon: "https://cdn.worldvectorlogo.com/logos/trello.svg" },
];

export default function IntegrationsSection() {
    return (
        <section className="py-24 relative overflow-hidden">
            {/* Spotlight Glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-blue-500/5 blur-[100px] rounded-full pointer-events-none" />

            <div className="max-w-7xl mx-auto px-6 text-center relative z-10">
                <h2 className="text-3xl md:text-4xl font-bold font-heading tracking-tight mb-16">
                    Connect your <span className="text-slate-400 italic font-medium">entire workflow.</span>
                </h2>
                
                <div className="flex flex-wrap justify-center items-center gap-12 md:gap-20">
                    {integrations.map((item, i) => (
                        <div key={i} className="group flex flex-col items-center gap-3">
                            <div className="w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-white dark:bg-white/5 border border-slate-100 dark:border-white/10 flex items-center justify-center p-4 shadow-sm group-hover:shadow-xl group-hover:border-blue-500/30 transition-all duration-500">
                                <img src={item.icon} alt={item.name} className="w-full h-full object-contain grayscale group-hover:grayscale-0 transition-all" />
                            </div>
                            <span className="text-[10px] font-bold tracking-widest uppercase opacity-0 group-hover:opacity-100 transition-opacity text-blue-500">
                                {item.name}
                            </span>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}