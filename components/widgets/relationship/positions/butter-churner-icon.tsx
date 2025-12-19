import type { SVGProps } from "react";

export function ButterChurnerIcon(props: SVGProps<SVGSVGElement>) {
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
      {/* Partner A (Inverted/Plough) */}
      <circle cx="30" cy="85" r="7" />
      <path d="M35 90 L 40 60" /> {/* Torso/Back arched up */}
      <path d="M40 60 L 20 40" /> {/* Legs over head */}
      <path d="M40 60 L 25 35" /> {/* Leg 2 */}

      {/* Partner B (Squatting over) */}
      <circle cx="60" cy="35" r="7" />
      <path d="M60 42 L 55 65" /> {/* Torso */}
      <path d="M55 65 L 50 90" /> {/* Leg 1 */}
      <path d="M55 65 L 75 90" /> {/* Leg 2 */}
      <path d="M60 50 L 45 60" /> {/* Arm */}
    </svg>
  );
}
