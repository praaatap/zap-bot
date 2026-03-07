import React from 'react';

const testimonials = [
    {
        name: "Sarah Chen",
        username: "@sarahchen_pm",
        body: "Zap Bot has transformed our team meetings. AI summaries are spot-on and save us hours of note-taking every week.",
        img: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&h=150&fit=crop&crop=face",
    },
    {
        name: "Marcus Johnson",
        username: "@marcustech",
        body: "Never miss a detail again. The real-time transcription is incredibly accurate and the chat feature is a game changer.",
        img: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
    },
    {
        name: "Emily Rodriguez",
        username: "@emilydev",
        body: "Our team launched using Zap Bot and collaboration improved instantly. The Slack integration is seamless.",
        img: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face",
    },
    {
        name: "Raj Patel",
        username: "@rajbuilds",
        body: "The AI bot joins automatically and sends perfect summaries to our team. Setup took literally 2 minutes.",
        img: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face",
    },
    {
        name: "Lisa Anderson",
        username: "@lisapm",
        body: "Action items automatically pushed to Jira? Mind blown. Zap Bot pays for itself in saved time.",
        img: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face",
    },
    {
        name: "David Kim",
        username: "@davidkimdev",
        body: "As a founder, Zap Bot helps me stay on top of every meeting without the manual work. Essential tool.",
        img: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
    },
    {
        name: "Jennifer Wright",
        username: "@jennwright",
        body: "The chat feature lets me search across all meeting transcripts instantly. Found a discussion from 3 months ago in seconds.",
        img: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&h=150&fit=crop&crop=face",
    },
    {
        name: "Alex Thompson",
        username: "@alexthompson",
        body: "Calendar integration works perfectly. Zap Bot joins every meeting and I never have to think about it.",
        img: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop&crop=face",
    },
    {
        name: "Michael Santos",
        username: "@msantos_tech",
        body: "Best investment for our remote team. Everyone gets automated email summaries and we're all aligned.",
        img: "https://images.unsplash.com/photo-1507591064344-4c6ce005b128?w=150&h=150&fit=crop&crop=face",
    },
];

const TestimonialCard = ({ img, name, username, body }: { img: string; name: string; username: string; body: string }) => {
    return (
        <div className="w-[350px] shrink-0 overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-b from-white/5 to-white/[0.02] p-8 shadow-[0px_2px_0px_0px_rgba(255,255,255,0.1)_inset] mx-3 backdrop-blur-sm">
            <div className="text-gray-300 leading-relaxed mb-6">{body}</div>
            <div className="flex items-center gap-4">
                <img src={img || "/placeholder.svg"} alt={name} className="h-12 w-12 rounded-full border border-white/20 object-cover" />
                <div className="flex flex-col">
                    <div className="font-semibold text-white">{name}</div>
                    <div className="text-sm text-cyan-400">{username}</div>
                </div>
            </div>
        </div>
    );
};

export default function Testimonials() {
    return (
        <section id="testimonials" className="py-24 overflow-hidden relative">
            <div className="mx-auto max-w-7xl px-4 text-center mb-16 animate-in fade-in slide-in-from-bottom-8 duration-700">
                <div className="inline-flex items-center gap-2 px-4 py-2 text-sm rounded-full bg-purple-900/40 border border-purple-500/30 text-purple-400 mb-6">
                    Loved by teams worldwide
                </div>
                <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-white mb-6">
                    Don't just take our word for it
                </h2>
                <p className="text-lg text-gray-400 max-w-2xl mx-auto">
                    From startups to enterprises, teams trust Zap Bot to capture every important meeting detail perfectly.
                </p>
            </div>

            <div className="relative flex flex-col gap-6 [mask-image:linear-gradient(to_right,transparent,black_10%,black_90%,transparent)] py-4">
                {/* Row 1 - Left to Right */}
                <div className="flex w-max animate-infinite-scroll hover:[animation-play-state:paused]">
                    {[...testimonials, ...testimonials].map((t, i) => (
                        <TestimonialCard key={`row1-${i}`} {...t} />
                    ))}
                </div>

                {/* Row 2 - Right to Left */}
                <div className="flex w-max animate-infinite-scroll-reverse hover:[animation-play-state:paused]">
                    {[...testimonials.slice().reverse(), ...testimonials.slice().reverse()].map((t, i) => (
                        <TestimonialCard key={`row2-${i}`} {...t} />
                    ))}
                </div>
            </div>
        </section>
    );
}
