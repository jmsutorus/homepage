import type { SVGProps } from "react";

export function CaptainIcon(props: SVGProps<SVGSVGElement>) {
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
      {/* Chair/Edge */}
      <path d="M20 70 L 50 70" strokeWidth="2" />
      <path d="M35 70 L 35 95" strokeWidth="2" />

      {/* Partner A (Sitting on edge) */}
      <circle cx="35" cy="40" r="7" />
      <path d="M35 47 L 35 70" /> {/* Torso */}
      <path d="M35 70 L 25 85" /> {/* Leg down */}
      <path d="M35 70 L 50 65" /> {/* Leg open/up */}

      {/* Partner B (Standing between legs) */}
      <circle cx="65" cy="25" r="7" />
      <path d="M65 32 L 60 60" /> {/* Torso - leaning in */}
      <path d="M60 60 L 60 95" /> {/* Leg 1 */}
      <path d="M60 60 L 75 95" /> {/* Leg 2 */}
      <path d="M65 40 L 40 50" /> {/* Arm holding partner */}
    </svg>
  );
}
