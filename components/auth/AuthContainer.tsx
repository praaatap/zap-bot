"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import AuthCard from "@/components/auth/AuthCard";
import { useAuthUIStore } from "@/stores/auth-ui-store";
import { CLERK_DARK_APPEARANCE } from "@/types/auth";
import type { AuthMode } from "@/types/auth";

type AuthContainerProps = {
    initialMode: AuthMode;
};

export default function AuthContainer({ initialMode }: AuthContainerProps) {
    const pathname = usePathname();
    const mode = useAuthUIStore((state) => state.mode);
    const setMode = useAuthUIStore((state) => state.setMode);

    useEffect(() => {
        setMode(initialMode);
    }, [initialMode, setMode]);

    useEffect(() => {
        if (pathname.includes("sign-up")) {
            setMode("sign-up");
            return;
        }
        setMode("sign-in");
    }, [pathname, setMode]);

    return (
        <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#050810] px-4 py-12">
            <div className="pointer-events-none absolute -left-16 top-16 h-72 w-72 rounded-full bg-cyan-500/10 blur-3xl" />
            <div className="pointer-events-none absolute -right-16 bottom-8 h-80 w-80 rounded-full bg-blue-500/10 blur-3xl" />

            <div className="relative z-10 grid w-full max-w-5xl overflow-hidden rounded-3xl border border-white/10 bg-white/5 shadow-[0_20px_80px_rgba(0,0,0,0.45)] backdrop-blur-xl md:grid-cols-2">
                <div className="flex flex-col justify-between border-b border-white/10 p-8 md:border-b-0 md:border-r md:border-white/10">
                    <div>
                        <p className="mb-4 inline-flex rounded-full border border-cyan-400/30 bg-cyan-400/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-cyan-300">
                            Zap Bot Access
                        </p>
                        <h1 className="text-3xl font-bold tracking-tight text-white md:text-4xl">
                            {mode === "sign-in" ? "Welcome Back" : "Create Your Workspace"}
                        </h1>
                        <p className="mt-4 text-sm leading-relaxed text-zinc-300">
                            {mode === "sign-in"
                                ? "Sign in to continue recording meetings, generating summaries, and asking transcript questions instantly."
                                : "Sign up to start automating meeting capture, transcript indexing, and AI analytics in one workflow."}
                        </p>
                    </div>

                    <div className="mt-8 space-y-3 text-xs text-zinc-300">
                        <div className="rounded-xl border border-white/10 bg-black/20 px-3 py-2">
                            1. Bot dispatch and meeting capture
                        </div>
                        <div className="rounded-xl border border-white/10 bg-black/20 px-3 py-2">
                            2. Transcript + summary + action items
                        </div>
                        <div className="rounded-xl border border-white/10 bg-black/20 px-3 py-2">
                            3. Meeting analytics and RAG chat
                        </div>
                    </div>
                </div>

                <div className="flex items-center justify-center p-6 md:p-8">
                    <AuthCard mode={mode} />
                </div>
            </div>
        </div>
    );
}
