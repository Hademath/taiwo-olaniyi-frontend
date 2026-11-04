import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type { Admin } from "./types";

type AuthState = {
  token: string | null; admin: Admin | null;
  setSession: (token: string, admin: Admin) => void;
  setToken: (token: string) => void;
  clear: () => void;
};

export const useAuthStore = create<AuthState>()(persist((set) => ({
  token: null, admin: null,
  setSession: (token, admin) => set({ token, admin }),
  setToken: (token) => set({ token }),
  clear: () => set({ token: null, admin: null }),
}), { name: "doctor-journal-owner", storage: createJSONStorage(() => sessionStorage) }));