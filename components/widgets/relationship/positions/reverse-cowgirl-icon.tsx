import type { SVGProps } from "react";

export function ReverseCowgirlIcon(props: SVGProps<SVGSVGElement>) {
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
      {/* Bottom Partner (Lying flat, head to right) */}
      {/* Head */}
      <circle cx="80" cy="80" r="7" />
      {/* Torso */}
      <path d="M73 82 L 45 82" />
      {/* Legs (Bent) */}
      <path d="M45 82 L 30 65 L 15 82" />

      {/* Top Partner (Sitting, facing left/feet) */}
      {/* Head */}
      <circle cx="45" cy="35" r="7" />
      {/* Torso */}
      <path d="M45 42 L 45 75" />
      {/* Arms (Lean back support) */}
      <path d="M45 55 L 55 75" />
      {/* Legs (Straddling) */}
      <path d="M45 75 L 35 88" />
      <path d="M45 75 L 53 88" />
    </svg>
  );
}
