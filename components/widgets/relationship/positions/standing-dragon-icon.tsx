import type { SVGProps } from "react";

export function StandingDragonIcon(props: SVGProps<SVGSVGElement>) {
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
      {/* Receiving Partner (Bent over standing) */}
      <circle cx="30" cy="40" r="7" />
      <path d="M30 47 L 50 65" /> {/* Torso */}
      <path d="M50 65 L 50 95" /> {/* Leg 1 */}
      <path d="M50 65 L 70 65" /> {/* Hip connection */}
      <path d="M30 55 L 45 70" /> {/* Arm support */}

      {/* Giving Partner (Standing Behind) */}
      <circle cx="75" cy="30" r="7" />
      <path d="M75 37 L 70 65" /> {/* Torso */}
      <path d="M70 65 L 70 95" /> {/* Leg 1 */}
      <path d="M70 65 L 85 95" /> {/* Leg 2 */}
      <path d="M72 45 L 55 65" /> {/* Arm */}
    </svg>
  );
}
