import type { SVGProps } from "react";

export function DownwardDogIcon(props: SVGProps<SVGSVGElement>) {
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
      {/* Partner A (V shape) */}
      <circle cx="30" cy="80" r="7" />
      <path d="M35 85 L 55 60" /> {/* Torso/Arms up */}
      <path d="M55 60 L 75 90" /> {/* Legs down */}

      {/* Partner B (Behind) */}
      <circle cx="85" cy="40" r="7" />
      <path d="M85 47 L 80 70" /> {/* Torso */}
      <path d="M80 70 L 90 95" /> {/* Legs */}
      <path d="M80 70 L 70 95" />
      <path d="M85 55 L 65 65" /> {/* Arms */}
    </svg>
  );
}
