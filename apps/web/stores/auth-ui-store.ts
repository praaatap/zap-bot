import { create } from "zustand";
import type { AuthMode } from "@/types/auth";

type AuthUIState = {
    mode: AuthMode;
    setMode: (mode: AuthMode) => void;
};

export const useAuthUIStore = create<AuthUIState>((set) => ({
    mode: "sign-in",
    setMode: (mode) => set({ mode }),
}));
