export type AuthMode = "sign-in" | "sign-up";

export type ClerkAppearance = {
    elements: Record<string, string>;
};

export const CLERK_DARK_APPEARANCE: ClerkAppearance = {
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
        footerActionLink: "text-white hover:text-zinc-300",
    },
};
