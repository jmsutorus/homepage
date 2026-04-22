import { cn } from "@/lib/utils";

interface MaterialSymbolProps {
  icon: string;
  className?: string;
  fill?: boolean;
  weight?: number;
  grade?: number;
  opsz?: number;
  size?: number | string;
  style?: React.CSSProperties;
}

export function MaterialSymbol({
  icon,
  className,
  fill = false,
  weight = 400,
  grade = 0,
  opsz = 24,
  size,
  style,
}: MaterialSymbolProps) {
  return (
    <span
      className={cn("material-symbols-outlined select-none", className)}
      style={{
        fontVariationSettings: `'FILL' ${fill ? 1 : 0}, 'wght' ${weight}, 'GRAD' ${grade}, 'opsz' ${opsz}`,
        fontSize: size,
        ...style,
      }}
    >
      {icon}
    </span>
  );
}
