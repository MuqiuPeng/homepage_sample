"use client";

import { useSyncExternalStore, type ReactNode } from "react";
import {
  DEFAULT_MODE,
  DEFAULT_THEME,
  MODE_STORAGE_KEY,
  THEME_STORAGE_KEY,
  type ThemeId,
  type ThemeMode,
} from "@/lib/themes";

// Module-level subscription set: setters notify all listeners; consumers
// subscribe via useSyncExternalStore. The DOM (`<html>` data-attrs) is the
// source of truth — this avoids any SSR / hydration mismatch since the
// pre-hydration ThemeScript already set the right attributes before React
// runs.
const listeners = new Set<() => void>();

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function getThemeSnapshot(): ThemeId {
  const v = document.documentElement.dataset.theme;
  return (v as ThemeId) || DEFAULT_THEME;
}

function getModeSnapshot(): ThemeMode {
  const v = document.documentElement.dataset.mode;
  return (v as ThemeMode) || DEFAULT_MODE;
}

function getThemeServerSnapshot(): ThemeId {
  return DEFAULT_THEME;
}
function getModeServerSnapshot(): ThemeMode {
  return DEFAULT_MODE;
}

function notify() {
  listeners.forEach((l) => l());
}

function setTheme(t: ThemeId) {
  document.documentElement.dataset.theme = t;
  try {
    localStorage.setItem(THEME_STORAGE_KEY, t);
  } catch {}
  notify();
}

function setMode(m: ThemeMode) {
  document.documentElement.dataset.mode = m;
  try {
    localStorage.setItem(MODE_STORAGE_KEY, m);
  } catch {}
  notify();
}

/**
 * No-op wrapper kept for layout-level structure / future enhancement (e.g.
 * MotionConfig context tied to mode). The store itself is module-level.
 */
export function ThemeProvider({ children }: { children: ReactNode }) {
  return <>{children}</>;
}

export function useTheme() {
  const theme = useSyncExternalStore(subscribe, getThemeSnapshot, getThemeServerSnapshot);
  const mode = useSyncExternalStore(subscribe, getModeSnapshot, getModeServerSnapshot);
  return {
    theme,
    mode,
    setTheme,
    setMode,
    toggleMode: () => setMode(mode === "light" ? "dark" : "light"),
  };
}
