import { Monitor, Moon, Sun } from "lucide-react";
import { useEffect } from "react";
import { applyTheme, useThemeStore } from "../stores/useThemeStore";

export function ThemeToggle() {
  const { theme, setTheme } = useThemeStore();

  useEffect(() => {
    applyTheme(theme);
  }, []);

  function cycle() {
    const next = theme === "light" ? "dark" : theme === "dark" ? "system" : "light";
    setTheme(next);
  }

  const Icon = theme === "dark" ? Moon : theme === "light" ? Sun : Monitor;
  const label = theme === "dark" ? "Dark mode" : theme === "light" ? "Light mode" : "System theme";

  return (
    <button className="icon-button" onClick={cycle} title={label} aria-label={label}>
      <Icon size={16} />
    </button>
  );
}
