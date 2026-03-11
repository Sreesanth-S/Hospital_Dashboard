import { Users, AlertTriangle, ShieldAlert, HeartPulse } from "lucide-react";
import { useStore } from "@/store";
import { StatCard } from "@/components/StatCard";
import { PatientTable } from "@/components/PatientTable";
import { RiskGaugeCard } from "@/components/RiskGaugeCard";
import { AlertPanel } from "@/components/AlertPanel";
import { NotificationCenter } from "@/components/NotificationCenter";
import { BPTrendChart, WeightChart, RiskScoreChart } from "@/components/HealthCharts";
import { AnalyticsCharts } from "@/components/AnalyticsCharts";

export default function Dashboard() {
  const { patients } = useStore();

  const highRisk = patients.filter((p) => p.riskLevel === "High");
  const topRisk = [...patients].sort((a, b) => b.preeclampsiaRisk - a.preeclampsiaRisk).slice(0, 3);

  const getRec = (pct: number) =>
    pct > 65
      ? "High risk detected. Immediate clinical evaluation recommended."
      : pct > 35
      ? "Moderate risk. Schedule follow-up within 48 hours."
      : "Low risk. Continue routine monitoring.";

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Dashboard</h2>
        <p className="text-sm text-muted-foreground">Maternal health monitoring overview</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Patients" value={patients.length} icon={Users} trend={12} />
        <StatCard title="High Risk" value={highRisk.length} icon={ShieldAlert} trend={-3} variant="danger" />
        <StatCard title="Critical Alerts" value={highRisk.length} icon={AlertTriangle} trend={5} variant="warning" />
        <StatCard title="Normal Monitoring" value={patients.filter((p) => p.riskLevel === "Low").length} icon={HeartPulse} trend={8} variant="success" />
      </div>

      {/* Patient Table */}
      <PatientTable />

      {/* Risk Predictions */}
      <div>
        <h3 className="text-lg font-semibold text-foreground mb-3">AI Risk Predictions</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {topRisk.map((p) => (
            <RiskGaugeCard
              key={p.id}
              patientName={p.name}
              label="Preeclampsia Risk"
              percentage={p.preeclampsiaRisk}
              recommendation={getRec(p.preeclampsiaRisk)}
            />
          ))}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
          {topRisk.map((p) => (
            <RiskGaugeCard
              key={p.id + "-ht"}
              patientName={p.name}
              label="Gestational Hypertension"
              percentage={p.hypertensionRisk}
              recommendation={getRec(p.hypertensionRisk)}
            />
          ))}
        </div>
      </div>

      {/* Alerts */}
      <AlertPanel />

      {/* Notifications */}
      <NotificationCenter />

      {/* Health Charts */}
      <div>
        <h3 className="text-lg font-semibold text-foreground mb-3">Health Trends</h3>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <BPTrendChart />
          <WeightChart />
          <RiskScoreChart />
        </div>
      </div>

      {/* Population Analytics */}
      <div>
        <h3 className="text-lg font-semibold text-foreground mb-3">Population Health Analytics</h3>
        <AnalyticsCharts />
      </div>
    </div>
  );
}
