import { useEffect, useState, useMemo } from "react";
import type { Theme, ThemeProviderProps } from "../lib/theme-context";
import { ThemeProviderContext, getInitialTheme, applyThemeToRoot } from "../lib/theme-context";

export function ThemeProvider({
  children,
  defaultTheme = "system",
  storageKey = "vite-ui-theme",
}: Readonly<ThemeProviderProps>) {
  const [theme, setThemeState] = useState<Theme>(() =>
    getInitialTheme(storageKey, defaultTheme)
  );

  useEffect(() => {
    applyThemeToRoot(theme);
  }, [theme]);

  const value = useMemo(() => ({
    theme,
    setTheme: (t: Theme) => {
      try {
        localStorage.setItem(storageKey, t);
      } catch {
        // ignore storage errors
      }
      setThemeState(t);
    },
  }), [theme, storageKey]);

  return (
    <ThemeProviderContext.Provider value={value}>
      {children}
    </ThemeProviderContext.Provider>
  );
}
