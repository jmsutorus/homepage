import type { SVGProps } from "react";

export function BalletDancerIcon(props: SVGProps<SVGSVGElement>) {
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
      {/* Partner A (Standing one leg up) */}
      <circle cx="35" cy="30" r="7" />
      <path d="M35 37 L 35 65" /> {/* Torso */}
      <path d="M35 65 L 30 95" /> {/* Leg 1 Standing */}
      <path d="M35 65 L 60 50" /> {/* Leg 2 Up */}

      {/* Partner B (Standing holding leg) */}
      <circle cx="65" cy="30" r="7" />
      <path d="M65 37 L 65 65" /> {/* Torso */}
      <path d="M65 65 L 60 95" /> {/* Leg 1 */}
      <path d="M65 65 L 80 95" /> {/* Leg 2 */}
      <path d="M65 45 L 45 45" /> {/* Arms */}
    </svg>
  );
}
