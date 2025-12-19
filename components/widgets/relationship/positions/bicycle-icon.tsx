import type { SVGProps } from "react";

export function BicycleIcon(props: SVGProps<SVGSVGElement>) {
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
      {/* Partner A (Lying on back, legs cycling) */}
      <circle cx="20" cy="80" r="7" />
      <path d="M25 85 L 55 85" /> {/* Torso */}
      <path d="M55 85 L 65 60" /> {/* Leg 1 Up */}
      <path d="M65 60 L 75 70" /> {/* Knee bent */}
      <path d="M55 85 L 75 80" /> {/* Leg 2 */}

      {/* Partner B (Kneeling/Entering) */}
      <circle cx="55" cy="50" r="7" />
      <path d="M55 57 L 55 80" /> {/* Torso */}
      <path d="M55 80 L 35 95" /> {/* Leg 1 */}
      <path d="M55 80 L 75 95" /> {/* Leg 2 */}
      <path d="M50 65 L 30 80" /> {/* Arm */}
    </svg>
  );
}
