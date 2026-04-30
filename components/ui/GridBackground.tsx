export function GridBackground() {
  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 -z-20 opacity-[0.35]"
      style={{
        backgroundImage:
          "linear-gradient(to right, rgba(15, 23, 42, 0.06) 1px, transparent 1px), linear-gradient(to bottom, rgba(15, 23, 42, 0.06) 1px, transparent 1px)",
        backgroundSize: "56px 56px",
        WebkitMaskImage:
          "radial-gradient(ellipse at center, rgba(0,0,0,0.85) 30%, transparent 75%)",
        maskImage:
          "radial-gradient(ellipse at center, rgba(0,0,0,0.85) 30%, transparent 75%)",
      }}
    />
  );
}
