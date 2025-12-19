import type { SVGProps } from "react";

export function DoggyIcon(props: SVGProps<SVGSVGElement>) {
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
      {/* Bottom Partner (Hands and Knees) */}
      {/* Head */}
      <circle cx="30" cy="60" r="7" />
      {/* Torso */}
      <path d="M30 67 L 70 67" />
      {/* Arms */}
      <path d="M35 67 L 35 90" />
      {/* Legs (Thigh down to knee, shin back) */}
      <path d="M70 67 L 70 90 L 85 90" />

      {/* Top Partner (Behind/Kneeling) */}
      {/* Head */}
      <circle cx="65" cy="35" r="7" />
      {/* Torso (Leaning forward) */}
      <path d="M65 42 L 75 67" />
      {/* Arms (Reaching to hips) */}
      <path d="M68 50 L 55 65" />
      {/* Legs */}
      <path d="M75 67 L 75 90 L 90 90" />
    </svg>
  );
}
