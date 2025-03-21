"use client";

import { useEffect, useState } from "react";
import { ThemeProvider as NextThemesProvider, useTheme as useNextTheme } from "next-themes";

type ThemeProviderProps = {
  children: React.ReactNode;
  defaultTheme?: string;
};

export function ThemeProvider({
  children,
  defaultTheme = "system",
}: ThemeProviderProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <>{children}</>;
  }

  return (
    <NextThemesProvider attribute="class" defaultTheme={defaultTheme}>
      {children}
    </NextThemesProvider>
  );
}

export const ThemeToggle = () => {
  const { theme, setTheme } = useNextTheme();
  return (
    <button
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      className="p-2 rounded-md"
    >
      {theme === "dark" ? "Light Mode" : "Dark Mode"}
    </button>
  );
};

// Re-export for convenience
export const useTheme = useNextTheme;