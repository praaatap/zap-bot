"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { account } from "@/lib/appwrite";
import { ID } from "appwrite";

export default function LoginAliasPage() {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [isLogin, setIsLogin] = useState(true);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (isLogin) {
                await account.createEmailPasswordSession(email, password);
            } else {
                await account.create(ID.unique(), email, password);
                await account.createEmailPasswordSession(email, password);
            }
            router.push("/dashboard");
        } catch (error) {
            console.error("Auth error:", error);
            alert(error instanceof Error ? error.message : "Authentication failed");
        }
    };

    return (
        <div className="flex h-screen items-center justify-center bg-slate-50">
            <div className="w-full max-w-sm rounded-[24px] bg-white p-8 shadow-sm border border-slate-200">
                <h2 className="mb-6 text-2xl font-bold text-slate-900 text-center">
                    {isLogin ? "Sign In" : "Create Account"}
                </h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="mb-1 block text-sm font-semibold text-slate-600">Email</label>
                        <input 
                            type="email" 
                            required
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            className="w-full rounded-xl border border-slate-200 px-4 py-2 text-sm text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 bg-slate-50"
                        />
                    </div>
                    <div>
                        <label className="mb-1 block text-sm font-semibold text-slate-600">Password</label>
                        <input 
                            type="password" 
                            required
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            className="w-full rounded-xl border border-slate-200 px-4 py-2 text-sm text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 bg-slate-50"
                        />
                    </div>
                    <button 
                        type="submit"
                        className="w-full rounded-xl bg-slate-900 py-2.5 text-sm font-bold text-white transition-all hover:bg-slate-800 hover:shadow-md"
                    >
                        {isLogin ? "Sign In" : "Sign Up"}
                    </button>
                    <p className="text-center text-xs text-slate-500 pt-2 cursor-pointer hover:underline" onClick={() => setIsLogin(!isLogin)}>
                        {isLogin ? "Need an account? Sign Up" : "Already have an account? Sign In"}
                    </p>
                </form>
            </div>
        </div>
    );
}
