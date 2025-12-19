import type { SVGProps } from "react";

export function LoveSeatIcon(props: SVGProps<SVGSVGElement>) {
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
      {/* Chair/Seat */}
      <path d="M30 85 L 70 85" strokeWidth="2" />
      <path d="M50 85 L 50 60" strokeWidth="2" />

      {/* Partner A (Sitting back to partner) */}
      <circle cx="40" cy="40" r="7" />
      <path d="M40 47 L 45 70" /> {/* Torso */}
      <path d="M45 70 L 35 90" /> {/* Legs */}

      {/* Partner B (Sitting holding A) */}
      <circle cx="65" cy="35" r="7" />
      <path d="M65 42 L 60 70" /> {/* Torso */}
      <path d="M60 70 L 75 90" /> {/* Legs */}
      <path d="M65 50 L 45 60" /> {/* Arms around */}
    </svg>
  );
}
