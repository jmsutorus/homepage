import type { SVGProps } from "react";

export function HotSeatIcon(props: SVGProps<SVGSVGElement>) {
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
      {/* Chair/Surface Hint */}
      <path d="M20 90 L 80 90" strokeWidth="2" strokeDasharray="4 4" />

      {/* Sitting Partner (On surface) */}
      {/* Head */}
      <circle cx="50" cy="50" r="7" />
      {/* Torso */}
      <path d="M50 57 L 50 85" />
      {/* Legs (Sitting) */}
      <path d="M50 85 L 50 90" />
      <path d="M50 85 L 70 90" />

      {/* Straddling Partner (Facing Sitting Partner) */}
      {/* Head */}
      <circle cx="35" cy="45" r="7" />
      {/* Torso */}
      <path d="M38 50 L 45 75" />
      {/* Legs (Wrapping) */}
      <path d="M45 75 L 55 85" />
      <path d="M45 75 L 30 85" />
      {/* Arms (Around neck) */}
      <path d="M38 55 L 50 55" />
    </svg>
  );
}
