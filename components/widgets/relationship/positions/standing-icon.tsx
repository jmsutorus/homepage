import type { SVGProps } from "react";

export function StandingIcon(props: SVGProps<SVGSVGElement>) {
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
      {/* Partner A (Standing) */}
      {/* Head */}
      <circle cx="35" cy="25" r="7" />
      {/* Torso */}
      <path d="M35 32 L 35 65" />
      {/* Legs */}
      <path d="M35 65 L 30 90" />
      <path d="M35 65 L 40 90" />
      {/* Arms (Holding) */}
      <path d="M35 45 L 50 45" />

      {/* Partner B (Standing/Wrap) */}
      {/* Head */}
      <circle cx="60" cy="30" r="7" />
      {/* Torso */}
      <path d="M60 37 L 55 60" />
      {/* Legs (Wrapped around) */}
      <path d="M55 60 L 40 50" />
      <path d="M55 60 L 40 65" />
      {/* Arms (Around neck) */}
      <path d="M60 45 L 40 30" />
    </svg>
  );
}
