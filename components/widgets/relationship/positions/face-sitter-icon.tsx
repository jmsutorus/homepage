import type { SVGProps } from "react";

export function FaceSitterIcon(props: SVGProps<SVGSVGElement>) {
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
      {/* Receiving Partner (Lying down) */}
      {/* Head */}
      <circle cx="50" cy="80" r="7" />
      {/* Torso */}
      <path d="M57 82 L 95 82" />
      {/* Legs (Flat) */}
      <path d="M20 82 L 43 82" />
      {/* Legs (Bent up if needed, or flat) - keeping simple flat */}

      {/* Sitting Partner (Squatting/Sitting) */}
      {/* Head */}
      <circle cx="50" cy="40" r="7" />
      {/* Torso */}
      <path d="M50 47 L 50 73" />
      {/* Legs (Squat) */}
      <path d="M50 73 L 30 85" />
      <path d="M50 73 L 70 85" />
      {/* Arms (Resting on knees/back) */}
      <path d="M50 55 L 75 65" />
    </svg>
  );
}
