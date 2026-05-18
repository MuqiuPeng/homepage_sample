export const THEMES = [
  { id: "A", labelKey: "themeA", brand: "#1b6b7f", accent: "#c9842f" },
  { id: "B", labelKey: "themeB", brand: "#1e40af", accent: "#f59e0b" },
  { id: "C", labelKey: "themeC", brand: "#15803d", accent: "#fcd34d" },
  { id: "D", labelKey: "themeD", brand: "#0c1e3e", accent: "#b45309" },
  { id: "E", labelKey: "themeE", brand: "#374151", accent: "#dc2626" },
] as const;

export type ThemeId = (typeof THEMES)[number]["id"];
export type ThemeMode = "light" | "dark";

export const DEFAULT_THEME: ThemeId = "A";
export const DEFAULT_MODE: ThemeMode = "light";

export const THEME_STORAGE_KEY = "theme";
export const MODE_STORAGE_KEY = "mode";
