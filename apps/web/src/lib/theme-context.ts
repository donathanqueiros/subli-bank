import { createContext } from "react";
import type { AppTheme, ColorMode } from "@/lib/theme";

export type ThemeContextValue = {
  theme: AppTheme;
  mode: ColorMode;
  setTheme: (theme: AppTheme) => void;
  setMode: (mode: ColorMode) => void;
  toggleMode: () => void;
};

export const ThemeContext = createContext<ThemeContextValue | null>(null);
