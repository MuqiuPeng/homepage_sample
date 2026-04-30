"use client";

import { useEffect } from "react";

const SNAP_IDS = [
  "hero",
  "about",
  "products",
  "industries",
  "why-us",
  "preview",
  "contact",
];
const HEADER_OFFSET = 72;
const ANIM_MS = 850;
// A wheel event arriving within this many ms of the previous one is treated
// as a continuation of the same gesture (e.g. a trackpad fling sends ~60Hz
// events for 500–700ms). Mouse-wheel clicks are typically separated by
// hundreds of ms, so each click registers as its own gesture.
const GESTURE_GAP_MS = 100;

/**
 * Replaces native scroll-snap on desktop with a JS-driven tween, so wheel
 * navigation between sections feels weighted instead of instant. Native
 * snap stays available as a fallback for keyboard, anchor links and
 * touch devices.
 */
export function SnapScrollController() {
  useEffect(() => {
    if (typeof window === "undefined") return;
    const fine = window.matchMedia("(pointer: fine)");
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (!fine.matches || reduced.matches) return;

    let isAnimating = false;
    let lastWheelTime = -Infinity;
    let rafId: number | null = null;

    function getPoints() {
      return SNAP_IDS.map((id) => {
        const el = document.getElementById(id);
        if (!el) return null;
        return {
          id,
          top: el.offsetTop - HEADER_OFFSET,
          height: el.offsetHeight,
        };
      }).filter((x): x is { id: string; top: number; height: number } => x !== null);
    }

    function findCurrentIdx(
      y: number,
      points: ReturnType<typeof getPoints>,
    ): number {
      for (let i = points.length - 1; i >= 0; i--) {
        if (y >= points[i].top - 60) return i;
      }
      return 0;
    }

    function ease(t: number) {
      // ease-in-out cubic — gentle settle on both ends
      return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
    }

    function snapTo(targetY: number) {
      if (isAnimating) return;
      const startY = window.scrollY;
      const distance = targetY - startY;
      if (Math.abs(distance) < 2) return;

      isAnimating = true;
      // Disable CSS snap during JS tween so the browser doesn't fight us
      // (inline style wins over stylesheet rules).
      const html = document.documentElement;
      const prevSnap = html.style.scrollSnapType;
      const prevBehavior = html.style.scrollBehavior;
      html.style.scrollSnapType = "none";
      html.style.scrollBehavior = "auto";

      // Safety: ensure styles get restored even if rAF stalls (e.g. tab hidden).
      const deadman = window.setTimeout(() => {
        if (isAnimating) {
          isAnimating = false;
          html.style.scrollSnapType = prevSnap;
          html.style.scrollBehavior = prevBehavior;
          if (rafId !== null) cancelAnimationFrame(rafId);
          rafId = null;
        }
      }, ANIM_MS + 400);

      const startTime = performance.now();

      function step(now: number) {
        const elapsed = now - startTime;
        const t = Math.min(elapsed / ANIM_MS, 1);
        window.scrollTo(0, Math.round(startY + distance * ease(t)));
        if (t < 1) {
          rafId = requestAnimationFrame(step);
        } else {
          window.clearTimeout(deadman);
          isAnimating = false;
          rafId = null;
          html.style.scrollSnapType = prevSnap;
          html.style.scrollBehavior = prevBehavior;
        }
      }
      rafId = requestAnimationFrame(step);
    }

    function onWheel(e: WheelEvent) {
      if (e.ctrlKey || e.metaKey) return;
      const now = performance.now();
      // Continuation = events still arriving within the gesture-gap window.
      // Always update lastWheelTime, even on blocked events, so the next
      // event sees the correct gap (a trackpad's momentum tail keeps
      // refreshing this and never opens a window for a 2nd snap).
      const continuesGesture = now - lastWheelTime < GESTURE_GAP_MS;
      lastWheelTime = now;

      // While the tween is running, block everything — no queueing, no extra snaps.
      if (isAnimating) {
        e.preventDefault();
        return;
      }

      // Animation is idle but events are still streaming from the same physical
      // gesture (e.g. trackpad momentum tail spilling past anim end) — block.
      if (continuesGesture) {
        e.preventDefault();
        return;
      }

      // Genuinely new user input.
      const points = getPoints();
      if (points.length === 0) return;
      const currentY = window.scrollY;
      const direction = e.deltaY > 0 ? 1 : -1;
      const idx = findCurrentIdx(currentY, points);
      const cur = points[idx];

      // If the current section is taller than the viewport and there's still
      // content above/below the visible area, allow the native scroll to flow.
      const sectionBottom = cur.top + cur.height;
      const viewportBottom = currentY + window.innerHeight;
      if (direction > 0 && viewportBottom < sectionBottom - 8) return;
      if (direction < 0 && currentY > cur.top + 8) return;

      const targetIdx = Math.max(
        0,
        Math.min(points.length - 1, idx + direction),
      );
      if (targetIdx === idx) return; // already at extreme — let native handle (e.g. footer)

      e.preventDefault();
      snapTo(points[targetIdx].top);
    }

    function onKey(e: KeyboardEvent) {
      // Replicate the damped feel for PgDn/PgUp/arrows so keyboard nav matches.
      const map: Record<string, 1 | -1 | "top" | "end"> = {
        PageDown: 1,
        PageUp: -1,
        ArrowDown: 1,
        ArrowUp: -1,
        " ": e.shiftKey ? -1 : 1,
        Home: "top",
        End: "end",
      };
      const action = map[e.key];
      if (action === undefined) return;
      if (
        document.activeElement instanceof HTMLInputElement ||
        document.activeElement instanceof HTMLTextAreaElement
      )
        return;

      const points = getPoints();
      if (points.length === 0) return;

      if (action === "top") {
        e.preventDefault();
        snapTo(points[0].top);
        return;
      }
      if (action === "end") {
        e.preventDefault();
        snapTo(points[points.length - 1].top);
        return;
      }

      const idx = findCurrentIdx(window.scrollY, points);
      const targetIdx = Math.max(0, Math.min(points.length - 1, idx + action));
      if (targetIdx === idx) return;
      e.preventDefault();
      snapTo(points[targetIdx].top);
    }

    window.addEventListener("wheel", onWheel, { passive: false });
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("keydown", onKey);
      if (rafId !== null) cancelAnimationFrame(rafId);
    };
  }, []);

  return null;
}
