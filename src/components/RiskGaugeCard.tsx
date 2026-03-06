interface RiskGaugeCardProps {
  patientName: string;
  label: string;
  percentage: number;
  recommendation: string;
}

export function RiskGaugeCard({ patientName, label, percentage, recommendation }: RiskGaugeCardProps) {
  const color =
    percentage > 65 ? "text-risk-high" : percentage > 35 ? "text-risk-moderate" : "text-risk-low";
  const bgColor =
    percentage > 65 ? "bg-risk-high" : percentage > 35 ? "bg-risk-moderate" : "bg-risk-low";
  const bgLight =
    percentage > 65 ? "bg-risk-high/15" : percentage > 35 ? "bg-risk-moderate/15" : "bg-risk-low/15";

  return (
    <div className="bg-card rounded-xl border border-border p-5 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <div>
          <p className="text-sm font-semibold text-card-foreground">{label}</p>
          <p className="text-xs text-muted-foreground">{patientName}</p>
        </div>
        <span className={`text-2xl font-bold ${color}`}>{percentage}%</span>
      </div>

      <div className={`w-full h-2.5 rounded-full ${bgLight}`}>
        <div
          className={`h-full rounded-full ${bgColor} transition-all duration-700`}
          style={{ width: `${percentage}%` }}
        />
      </div>

      <p className="text-xs text-muted-foreground mt-3 leading-relaxed">{recommendation}</p>
    </div>
  );
}
