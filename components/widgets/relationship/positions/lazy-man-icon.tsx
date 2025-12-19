import type { SVGProps } from "react";

export function LazyManIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 100 100"
      fill="none"
      stroke="currentColor"
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      {/* Partner A (Lying Flat) */}
      <circle cx="20" cy="80" r="7" />
      <path d="M25 82 L 85 82" /> {/* Body */}
      <path d="M85 82 L 85 70" /> {/* Knees up slightly? Or just flat. Let's do flat. */}

      {/* Partner B (Straddling/On Top) */}
      <circle cx="55" cy="40" r="7" />
      <path d="M55 47 L 55 75" /> {/* Torso vertical */}
      <path d="M55 75 L 45 85" /> {/* Legs straddling */}
      <path d="M55 75 L 65 85" />
      <path d="M55 55 L 55 65" /> {/* Arms relaxed */}
    </svg>
  );
}
