import { createContext, useState, useEffect, useContext } from "react";

export const ThemeContext = createContext();

const LIGHT = {
  bg:"#f5f7fa", surface:"#ffffff", raised:"#f0f3f8",
  border:"rgba(0,0,0,0.09)", text:"#0a0d1a", muted:"#64748b",
  dim:"#374151", accent:"#0055d4", success:"#2a8a60",
  danger:"#a84848", warn:"#9a7828", gold:"#8a7020",
  name:"light",
};

const DARK = {
  bg:"#07090f", surface:"#0e1121", raised:"#141829",
  border:"rgba(100,140,255,0.13)", text:"#dce8ff",
  muted:"#8896b0", dim:"#a0b4cc", accent:"#3b6eff",
  success:"#3dab80", danger:"#c86060", warn:"#b8943a",
  gold:"#C9A84C", name:"dark",
};

export function ThemeProvider({ children }) {
  const [isDark, setIsDark] = useState(() => {
    // Check localStorage first
    const stored = localStorage.getItem("vima-theme");
    if (stored) return stored === "dark";
    
    // Default: auto-switch based on time
    const hour = new Date().getHours();
    return hour < 6 || hour >= 20; // 8pm-6am = dark
  });

  // Save to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("vima-theme", isDark ? "dark" : "light");
    document.documentElement.style.background = isDark ? DARK.bg : LIGHT.bg;
    document.body.style.background = isDark ? DARK.bg : LIGHT.bg;
  }, [isDark]);

  const theme = isDark ? DARK : LIGHT;

  return (
    <ThemeContext.Provider value={{ isDark, setIsDark, theme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
}
