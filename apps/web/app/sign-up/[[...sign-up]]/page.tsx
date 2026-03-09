import { SignUp } from "@clerk/nextjs";

export default function Page() {
    return (
        <div className="flex min-h-screen items-center justify-center bg-black">
            <SignUp
                appearance={{
                    elements: {
                        formButtonPrimary: "bg-white text-black hover:bg-zinc-200",
                        card: "bg-zinc-900 border border-zinc-800 shadow-none",
                        headerTitle: "text-white",
                        headerSubtitle: "text-zinc-400",
                        socialButtonsBlockButton: "bg-zinc-900 border border-zinc-800 text-white hover:bg-zinc-800",
                        dividerLine: "bg-zinc-800",
                        dividerText: "text-zinc-500",
                        formFieldLabel: "text-zinc-400",
                        formFieldInput: "bg-black border-zinc-800 text-white",
                        footerActionText: "text-zinc-400",
                        footerActionLink: "text-white hover:text-zinc-300"
                    }
                }}
            />
        </div>
    );
}
