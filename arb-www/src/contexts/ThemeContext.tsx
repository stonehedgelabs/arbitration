import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { themeSystems, getSystemTheme } from "../../theme";

type ThemeMode = "light" | "dark" | "system";

interface ThemeContextType {
  theme: "light" | "dark";
  themeMode: ThemeMode;
  setThemeMode: (mode: ThemeMode) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [themeMode, setThemeModeState] = useState<ThemeMode>(() => {
    // Check localStorage for saved preference
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("theme-mode");
      return (saved as ThemeMode) || "system";
    }
    return "system";
  });

  const [systemTheme, setSystemTheme] = useState<"light" | "dark">(() => {
    return getSystemTheme();
  });

  const [, setIsInitialLoad] = useState(true);

  // Determine the actual theme to use
  const theme = themeMode === "system" ? systemTheme : themeMode;

  // Handle initial load transition prevention
  useEffect(() => {
    if (typeof window === "undefined") return;

    // Add no-transition class on initial load
    document.documentElement.classList.add("no-transition");

    // Remove no-transition class after initial load
    const timer = setTimeout(() => {
      setIsInitialLoad(false);
      document.documentElement.classList.remove("no-transition");
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  // Listen for system theme changes
  useEffect(() => {
    if (typeof window === "undefined") return;

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

    const handleChange = (e: MediaQueryListEvent) => {
      setSystemTheme(e.matches ? "dark" : "light");
    };

    // Modern browsers
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener("change", handleChange);
    } else {
      // Fallback for older browsers
      mediaQuery.addListener(handleChange);
    }

    return () => {
      if (mediaQuery.removeEventListener) {
        mediaQuery.removeEventListener("change", handleChange);
      } else {
        mediaQuery.removeListener(handleChange);
      }
    };
  }, []);

  // Save theme preference to localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("theme-mode", themeMode);
    }
  }, [themeMode]);

  const setThemeMode = (mode: ThemeMode) => {
    setThemeModeState(mode);
  };

  const toggleTheme = () => {
    setThemeModeState((prev) => {
      if (prev === "system") return "light";
      if (prev === "light") return "dark";
      return "system";
    });
  };

  const value: ThemeContextType = {
    theme,
    themeMode,
    setThemeMode,
    toggleTheme,
  };

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};

// Export the current theme system for use in ChakraProvider
export const getCurrentThemeSystem = (theme: "light" | "dark") => {
  return themeSystems[theme];
};
