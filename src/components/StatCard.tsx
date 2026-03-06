import type { LucideIcon } from "lucide-react";
import { TrendingUp, TrendingDown } from "lucide-react";

interface StatCardProps {
  title: string;
  value: number;
  icon: LucideIcon;
  trend: number;
  variant?: "default" | "warning" | "danger" | "success";
}

const variantStyles = {
  default: "bg-primary/10 text-primary",
  success: "bg-risk-low/10 text-risk-low",
  warning: "bg-risk-moderate/10 text-risk-moderate",
  danger: "bg-risk-high/10 text-risk-high",
};

export function StatCard({ title, value, icon: Icon, trend, variant = "default" }: StatCardProps) {
  const positive = trend >= 0;

  return (
    <div className="bg-card rounded-xl border border-border p-5 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-muted-foreground font-medium">{title}</p>
          <p className="text-3xl font-bold text-card-foreground mt-1">{value}</p>
        </div>
        <div className={`p-2.5 rounded-lg ${variantStyles[variant]}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
      <div className="flex items-center gap-1.5 mt-3">
        {positive ? (
          <TrendingUp className="w-3.5 h-3.5 text-risk-low" />
        ) : (
          <TrendingDown className="w-3.5 h-3.5 text-risk-high" />
        )}
        <span className={`text-xs font-semibold ${positive ? "text-risk-low" : "text-risk-high"}`}>
          {positive ? "+" : ""}{trend}%
        </span>
        <span className="text-xs text-muted-foreground">vs last week</span>
      </div>
    </div>
  );
}
