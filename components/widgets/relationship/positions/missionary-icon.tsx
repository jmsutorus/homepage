import type { SVGProps } from "react";

export function MissionaryIcon(props: SVGProps<SVGSVGElement>) {
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
      {/* Bottom Partner (Lying down) */}
      {/* Head */}
      <circle cx="20" cy="80" r="7" />
      {/* Torso */}
      <path d="M27 82 L 60 82" />
      {/* Legs (Bent knees) */}
      <path d="M60 82 L 75 65 L 90 82" />
      
      {/* Top Partner (On top) */}
      {/* Head */}
      <circle cx="25" cy="55" r="7" />
      {/* Torso */}
      <path d="M28 60 L 60 65" />
      {/* Arms (Supporting weight) */}
      <path d="M30 60 L 30 82" />
      {/* Legs (Straight back) */}
      <path d="M60 65 L 85 70" />
    </svg>
  );
}
