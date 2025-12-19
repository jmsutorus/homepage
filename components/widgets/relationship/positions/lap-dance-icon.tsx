import type { SVGProps } from "react";

export function LapDanceIcon(props: SVGProps<SVGSVGElement>) {
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
      {/* Chair Hint */}
      <path d="M55 90 L 90 90" strokeWidth="2" />
      <path d="M70 90 L 70 60" strokeWidth="2" />

      {/* Sitting Partner (Watching) */}
      {/* Head */}
      <circle cx="75" cy="40" r="7" />
      {/* Torso */}
      <path d="M75 47 L 70 70" />
      {/* Legs */}
      <path d="M70 70 L 90 90" />
      <path d="M70 70 L 50 90" />

      {/* Dancing Partner (Standing/Hovering over lap) */}
      {/* Head */}
      <circle cx="40" cy="35" r="7" />
      {/* Torso (Arched back) */}
      <path d="M42 42 Q 35 55 45 65" />
      {/* Legs */}
      <path d="M45 65 L 45 90" />
      <path d="M45 65 L 30 90" />
      {/* Arm (Up/Dancing) */}
      <path d="M42 45 L 30 30" />
    </svg>
  );
}
