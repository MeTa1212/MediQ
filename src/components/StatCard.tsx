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
    <div className={`rounded-2xl p-4 border animate-fade-up ${variantClasses[variant]}`}>
      <div className="flex items-start justify-between mb-3">
        <span className="text-xl">{icon}</span>
        {subtitle && <span className="text-xs font-medium opacity-70">{subtitle}</span>}
      </div>
      <div className="text-2xl font-extrabold leading-none mb-1">{value}</div>
      <div className="text-xs font-medium opacity-70">{label}</div>
    </div>
  );
}
