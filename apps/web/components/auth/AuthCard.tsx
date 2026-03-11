"use client";

import Link from "next/link";
import { SignIn, SignUp } from "@clerk/nextjs";
import type { AuthMode, ClerkAppearance } from "@/types/auth";

type AuthCardProps = {
    mode: AuthMode;
    appearance: ClerkAppearance;
};

export default function AuthCard({ mode, appearance }: AuthCardProps) {
    return (
        <div className="w-full max-w-md">
            {mode === "sign-in" ? (
                <SignIn
                    appearance={appearance}
                    routing="path"
                    path="/sign-in"
                    signUpUrl="/sign-up"
                    fallbackRedirectUrl="/dashboard"
                />
            ) : (
                <SignUp
                    appearance={appearance}
                    routing="path"
                    path="/sign-up"
                    signInUrl="/sign-in"
                    fallbackRedirectUrl="/dashboard"
                />
            )}
            <div className="mt-4 text-center text-xs text-zinc-500">
                {mode === "sign-in" ? "Need an account?" : "Already have an account?"}{" "}
                <Link
                    className="text-zinc-200 hover:text-white underline underline-offset-2"
                    href={mode === "sign-in" ? "/sign-up" : "/sign-in"}
                >
                    {mode === "sign-in" ? "Sign up" : "Sign in"}
                </Link>
            </div>
        </div>
    );
}
