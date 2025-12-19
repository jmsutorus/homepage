import type { SVGProps } from "react";

export function WheelbarrowIcon(props: SVGProps<SVGSVGElement>) {
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
      {/* Bottom Partner (Walking on hands) */}
      {/* Head */}
      <circle cx="20" cy="80" r="7" />
      {/* Torso */}
      <path d="M25 80 L 55 70" />
      {/* Arms */}
      <path d="M25 80 L 25 95" />
      {/* Legs (Held up) */}
      <path d="M55 70 L 80 50" />

      {/* Top Partner (Standing holding legs) */}
      {/* Head */}
      <circle cx="90" cy="30" r="7" />
      {/* Torso */}
      <path d="M90 37 L 85 65" />
      {/* Legs */}
      <path d="M85 65 L 75 95" />
      <path d="M85 65 L 95 95" />
      {/* Arms (Holding partner's legs) */}
      <path d="M88 45 L 80 50" />
    </svg>
  );
}
