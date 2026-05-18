import Script from "next/script";

/**
 * Inline script that runs before any body content paints, so the right
 * `data-theme` / `data-mode` attributes are set on <html> in time for the
 * first frame — no FOUC.
 *
 * Reads localStorage for previous selection; falls back to system color
 * preference for mode and theme A for brand.
 *
 * `next/script` with `strategy="beforeInteractive"` hoists this into <head>
 * and guarantees execution before React hydration. (Plain <script> tags in
 * components emit a React 19 warning since they don't re-execute on
 * client-side renders.)
 */
const SCRIPT = `
(function(){try{
  var t=localStorage.getItem('theme');
  if(t!=='A'&&t!=='B'&&t!=='C'&&t!=='D'&&t!=='E')t='A';
  var m=localStorage.getItem('mode');
  if(m!=='light'&&m!=='dark'){m=matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light';}
  var h=document.documentElement;
  h.dataset.theme=t;
  h.dataset.mode=m;
}catch(e){}})();
`.trim();

export function ThemeScript() {
  return (
    // The lint rule is for Pages Router; App Router's root layout (this is
    // it — there's no app/layout.tsx wrapping above) is the documented place
    // for `beforeInteractive`.
    // eslint-disable-next-line @next/next/no-before-interactive-script-outside-document
    <Script id="theme-init" strategy="beforeInteractive">
      {SCRIPT}
    </Script>
  );
}
