import type { SVGProps } from "react";

export function PretzelIcon(props: SVGProps<SVGSVGElement>) {
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
      {/* Complex intertwine hint */}
      {/* Partner A (Lying Side) */}
      <circle cx="30" cy="50" r="7" />
      <path d="M35 55 L 60 70" /> {/* Torso */}
      <path d="M60 70 L 80 50" /> {/* Leg Up/Wrap */}
      <path d="M60 70 L 40 90" /> {/* Leg Down */}

      {/* Partner B (Intertwined) */}
      <circle cx="70" cy="50" r="7" />
      <path d="M65 55 L 40 70" /> {/* Torso */}
      <path d="M40 70 L 20 50" /> {/* Leg Wrap */}
      <path d="M40 70 L 60 90" /> {/* Leg Down */}
    </svg>
  );
}
