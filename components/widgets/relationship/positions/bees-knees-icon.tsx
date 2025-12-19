import type { SVGProps } from "react";

export function BeesKneesIcon(props: SVGProps<SVGSVGElement>) {
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
      {/* Receiving Partner (Kneeling Upright) */}
      {/* Head */}
      <circle cx="35" cy="40" r="7" />
      {/* Torso (Vertical) */}
      <path d="M35 47 L 35 75" />
      {/* Legs (Kneeling) */}
      <path d="M35 75 L 35 90 L 15 90" />
      {/* Arm (Back support or hands on thighs) */}
      <path d="M35 55 L 25 70" />

      {/* Giving Partner (Behind/Kneeling) */}
      {/* Head */}
      <circle cx="65" cy="35" r="7" />
      {/* Torso */}
      <path d="M65 42 L 55 70" />
      {/* Legs */}
      <path d="M55 70 L 60 90 L 80 90" />
      {/* Arm (Holding hips) */}
      <path d="M62 50 L 40 70" />
    </svg>
  );
}
