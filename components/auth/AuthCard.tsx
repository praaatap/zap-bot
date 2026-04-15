"use client";

import Link from "next/link";
import { SignIn, SignUp } from "@clerk/nextjs";

export default function AuthCard({ mode }: { mode: 'sign-in' | 'sign-up' }) {
    return (
        <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-xl border border-slate-100">
            {mode === "sign-in" ? (
                <SignIn 
                    appearance={{
                        elements: {
                            rootBox: "w-full",
                            card: "shadow-none border-none p-0 bg-transparent w-full",
                        }
                    }}
                />
            ) : (
                <SignUp 
                    appearance={{
                        elements: {
                            rootBox: "w-full",
                            card: "shadow-none border-none p-0 bg-transparent w-full",
                        }
                    }}
                />
            )}
            <div className="mt-8 text-center">
                <p className="text-slate-500 text-[14px]">
                    {mode === "sign-in" ? (
                        <>
                            Don't have an account?{" "}
                            <Link href="/sign-up" className="text-blue-600 hover:text-blue-700 font-bold">
                                Sign up
                            </Link>
                        </>
                    ) : (
                        <>
                            Already have an account?{" "}
                            <Link href="/sign-in" className="text-blue-600 hover:text-blue-700 font-bold">
                                Sign in
                            </Link>
                        </>
                    )}
                </p>
            </div>
        </div>
    );
}
