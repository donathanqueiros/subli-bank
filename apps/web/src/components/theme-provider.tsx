import { useEffect, useMemo, useState, type ReactNode } from "react";
import { ThemeContext } from "@/lib/theme-context";
import {
  applyColorMode,
  applyTheme,
  DEFAULT_MODE,
  DEFAULT_THEME,
  getStoredColorMode,
  getStoredTheme,
  persistColorMode,
  persistTheme,
  type AppTheme,
  type ColorMode,
} from "@/lib/theme";

type ThemeProviderProps = {
  children: ReactNode;
};

export function ThemeProvider({ children }: ThemeProviderProps) {
  const [theme, setThemeState] = useState<AppTheme>(() => getStoredTheme());
  const [mode, setModeState] = useState<ColorMode>(() => getStoredColorMode());

  useEffect(() => {
    applyTheme(theme);
    persistTheme(theme);
  }, [theme]);

  useEffect(() => {
    applyColorMode(mode);
    persistColorMode(mode);
  }, [mode]);

  const value = useMemo(
    () => ({
      theme,
      mode,
      setTheme: setThemeState,
      setMode: setModeState,
      toggleMode: () => {
        setModeState((currentMode) => currentMode === "dark" ? "light" : "dark");
      },
    }),
    [mode, theme],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export { DEFAULT_MODE, DEFAULT_THEME };
