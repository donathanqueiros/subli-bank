import { createContext } from "react";
import type { AuthUser } from "@/lib/auth-storage";

export type AuthContextValue = {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isBootstrapping: boolean;
  setUser: (user: AuthUser | null) => void;
  logout: () => void;
};

export const AuthContext = createContext<AuthContextValue | null>(null);