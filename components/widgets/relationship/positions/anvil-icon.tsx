import type { SVGProps } from "react";

export function AnvilIcon(props: SVGProps<SVGSVGElement>) {
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
      {/* Partner A (Lying back, legs on shoulders) */}
      <circle cx="30" cy="80" r="7" />
      <path d="M35 85 L 60 85" /> {/* Torso */}
      <path d="M60 85 L 75 50" /> {/* Legs High */}

      {/* Partner B (Kneeling/Pushing) */}
      <circle cx="70" cy="40" r="7" />
      <path d="M70 47 L 65 75" /> {/* Torso */}
      <path d="M65 75 L 85 90" /> {/* Kneeling Legs */}
      <path d="M70 55 L 55 70" /> {/* Arms support */}
    </svg>
  );
}
