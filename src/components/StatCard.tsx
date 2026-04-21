import { ReactNode } from "react";

interface StatCardProps {
  icon: ReactNode;
  label: string;
  value: string | number;
  subtitle?: string;
  variant?: "primary" | "destructive" | "success" | "warning";
}

const variantMap = {
  primary:     { bg: "bg-blue-500/8",    border: "border-blue-500/12",   text: "text-blue-400",    glow: "rgba(59,130,246,0.06)"  },
  destructive: { bg: "bg-rose-500/8",    border: "border-rose-500/12",   text: "text-rose-400",    glow: "rgba(244,63,94,0.06)"   },
  success:     { bg: "bg-emerald-500/8", border: "border-emerald-500/12",text: "text-emerald-400", glow: "rgba(34,197,94,0.06)"  },
  warning:     { bg: "bg-amber-500/8",   border: "border-amber-500/12",  text: "text-amber-400",   glow: "rgba(245,158,11,0.06)"  },
};

export function StatCard({ icon, label, value, subtitle, variant = "primary" }: StatCardProps) {
  const v = variantMap[variant];

  return (
    <div
      className={`
        group relative overflow-hidden rounded-2xl border p-5
        transition-all duration-200
        hover:-translate-y-0.5 hover:shadow-[var(--shadow-card-hover)]
        ${v.bg} ${v.border}
        shadow-[var(--shadow-card)]
      `}
    >
      {/* Subtle top highlight */}
      <div className="pointer-events-none absolute inset-x-4 top-0 h-px bg-white/[0.08]" />

      <div className="flex items-start justify-between mb-4">
        <div className={`flex h-9 w-9 items-center justify-center rounded-xl ${v.bg} border ${v.border}`}>
          <span className={`[&_svg]:h-4 [&_svg]:w-4 ${v.text}`}>{icon}</span>
        </div>
        {subtitle && (
          <span className="text-[10px] font-semibold uppercase tracking-wider text-white/30">
            {subtitle}
          </span>
        )}
      </div>

      <div className={`text-2xl font-bold tracking-tight leading-none mb-1.5 ${v.text}`}>
        {value}
      </div>
      <div className="text-[11px] font-medium uppercase tracking-wider text-white/40">
        {label}
      </div>
    </div>
  );
}
