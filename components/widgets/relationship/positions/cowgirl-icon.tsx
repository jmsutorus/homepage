import type { SVGProps } from "react";

export function CowgirlIcon(props: SVGProps<SVGSVGElement>) {
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
      {/* Bottom Partner */}
      {/* Head */}
      <circle cx="80" cy="80" r="7" />
      {/* Torso */}
      <path d="M73 82 L 45 82" />
      {/* Legs (Knees up) */}
      <path d="M45 82 L 30 65 L 15 82" />
      {/* Arms (Reaching up/holding) */}
      <path d="M65 82 L 55 70" />

      {/* Top Partner */}
      {/* Head */}
      <circle cx="45" cy="35" r="7" />
      {/* Torso */}
      <path d="M45 42 L 45 75" />
      {/* Arms (Resting on partner's chest) */}
      <path d="M45 50 L 60 70" />
      {/* Legs (Straddling) */}
      <path d="M45 75 L 35 88" />
      <path d="M45 75 L 53 88" />
    </svg>
  );
}
