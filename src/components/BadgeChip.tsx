import { ReactNode } from "react";

interface BadgeChipProps {
  children: ReactNode;
  className?: string;
}

export function BadgeChip({ children, className = "" }: BadgeChipProps) {
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold tracking-wide ${className}`}>
      {children}
    </span>
  );
}
