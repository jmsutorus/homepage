import type { SVGProps } from "react";

export function SpooningIcon(props: SVGProps<SVGSVGElement>) {
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
      {/* Big Spoon (Behind) */}
      {/* Head */}
      <circle cx="20" cy="50" r="7" />
      {/* Torso (Curved) */}
      <path d="M25 55 Q 40 60 50 55" />
      {/* Arm (Over) */}
      <path d="M30 55 Q 45 45 60 55" />
      {/* Legs */}
      <path d="M50 55 L 70 70" />
      <path d="M50 55 L 70 40" />

      {/* Little Spoon (Front) */}
      {/* Head */}
      <circle cx="35" cy="60" r="7" />
      {/* Torso */}
      <path d="M40 65 Q 55 70 65 65" />
      {/* Legs */}
      <path d="M65 65 L 85 80" />
      <path d="M65 65 L 85 50" />
    </svg>
  );
}
