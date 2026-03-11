import { create } from "zustand";

type Theme = "light" | "dark";

interface ThemeState {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
  initializeTheme: () => void;
}

export const useThemeStore = create<ThemeState>((set, get) => ({
  theme: "light",
  
  setTheme: (theme: Theme) => {
    set({ theme });
    localStorage.setItem("hospital-dashboard-theme", theme);
    
    // Apply theme to document
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  },
  
  toggleTheme: () => {
    const currentTheme = get().theme;
    const newTheme = currentTheme === "light" ? "dark" : "light";
    get().setTheme(newTheme);
  },
  
  initializeTheme: () => {
    // Check localStorage for saved theme
    const savedTheme = localStorage.getItem("hospital-dashboard-theme") as Theme | null;
    
    if (savedTheme) {
      get().setTheme(savedTheme);
    } else {
      // Check system preference
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      get().setTheme(prefersDark ? "dark" : "light");
    }
  },
}));
