import type { SVGProps } from "react";

export function MountainClimberIcon(props: SVGProps<SVGSVGElement>) {
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
      {/* Receiving Partner (Bent over, one leg up?) or Prone with hips up */}
      {/* Let's do common "Prone with pile of pillows/hips high" variation or "Doggy one leg up" */}
      {/* Head */}
      <circle cx="20" cy="80" r="7" />
      {/* Torso (Downward slope) */}
      <path d="M25 80 L 50 60" />
      {/* Arms (Supporting) */}
      <path d="M25 80 L 30 95" />
      {/* Leg 1 (Kneeling) */}
      <path d="M50 60 L 50 95" />
      {/* Leg 2 (Straight back/Up? - standard mountain climber usually implies hands/feet on floor hips high) */}
      <path d="M50 60 L 70 85" />

      {/* Giving Partner (Standing Behind) */}
      {/* Head */}
      <circle cx="75" cy="30" r="7" />
      {/* Torso */}
      <path d="M75 37 L 70 65" />
      {/* Legs */}
      <path d="M70 65 L 70 95" />
      <path d="M70 65 L 85 95" />
      {/* Arms */}
      <path d="M72 45 L 55 60" />
    </svg>
  );
}
