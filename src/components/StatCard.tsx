import { ReactNode } from "react";

interface StatCardProps {
  icon: ReactNode;
  label: string;
  value: string | number;
  subtitle?: string;
  variant?: "primary" | "destructive" | "success" | "warning";
}

const variantClasses = {
  primary: "bg-primary/5 border-primary/10 text-primary",
  destructive: "bg-destructive/5 border-destructive/10 text-destructive",
  success: "bg-success/5 border-success/10 text-success",
  warning: "bg-warning/5 border-warning/10 text-warning",
};

export function StatCard({ icon, label, value, subtitle, variant = "primary" }: StatCardProps) {
  return (
    <div className={`relative overflow-hidden rounded-[24px] p-5 border backdrop-blur-xl shadow-lg hover:-translate-y-1 hover:shadow-xl transition-all duration-300 animate-fade-up ${variantClasses[variant]}`}>
      <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent pointer-events-none" />
      <div className="flex items-start justify-between mb-3">
        <span className="text-xl">{icon}</span>
        {subtitle && <span className="text-xs font-medium opacity-70">{subtitle}</span>}
      </div>
      <div className="text-3xl font-black tracking-tight leading-none mb-1 shadow-sm">{value}</div>
      <div className="text-xs tracking-wider uppercase font-bold opacity-70">{label}</div>
    </div>
  );
}
