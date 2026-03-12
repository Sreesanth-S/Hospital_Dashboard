import { Users, AlertTriangle, ShieldAlert, HeartPulse } from "lucide-react";
import { useStore } from "@/store/supabaseStore";
import { StatCard } from "@/components/StatCard";
import { PatientTable } from "@/components/PatientTable";
import { RiskGaugeCard } from "@/components/RiskGaugeCard";
import { NotificationCenter } from "@/components/NotificationCenter";
import { BPTrendChart, WeightChart, RiskScoreChart } from "@/components/HealthCharts";
import { AnalyticsCharts } from "@/components/AnalyticsCharts";
import type { Alert, Patient } from "@/types";

const WEEK_IN_MS = 7 * 24 * 60 * 60 * 1000;

function countWithinWindow<T>(items: T[], getTimestamp: (item: T) => string, start: number, end: number) {
  return items.filter((item) => {
    const timestamp = new Date(getTimestamp(item)).getTime();
    return Number.isFinite(timestamp) && timestamp >= start && timestamp < end;
  }).length;
}

function calculateTrend<T>(items: T[], getTimestamp: (item: T) => string) {
  const now = Date.now();
  const currentPeriodStart = now - WEEK_IN_MS;
  const previousPeriodStart = currentPeriodStart - WEEK_IN_MS;
  const currentCount = countWithinWindow(items, getTimestamp, currentPeriodStart, now);
  const previousCount = countWithinWindow(items, getTimestamp, previousPeriodStart, currentPeriodStart);

  if (previousCount === 0) {
    return currentCount === 0 ? 0 : 100;
  }

  return Math.round(((currentCount - previousCount) / previousCount) * 100);
}

export default function Dashboard() {
  const { patients, alerts } = useStore();

  const highRisk = patients.filter((p) => p.riskLevel === "High");
  const lowRisk = patients.filter((p) => p.riskLevel === "Low");
  const unresolvedAlerts = alerts.filter((alert) => !alert.resolved);
  const topRisk = [...patients].sort((a, b) => b.preeclampsiaRisk - a.preeclampsiaRisk).slice(0, 3);
  const totalPatientsTrend = calculateTrend<Patient>(patients, (patient) => patient.lastUpdated);
  const highRiskTrend = calculateTrend<Patient>(highRisk, (patient) => patient.lastUpdated);
  const criticalAlertsTrend = calculateTrend<Alert>(unresolvedAlerts, (alert) => alert.timestamp);
  const normalMonitoringTrend = calculateTrend<Patient>(lowRisk, (patient) => patient.lastUpdated);

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
        <StatCard title="Total Patients" value={patients.length} icon={Users} trend={totalPatientsTrend} />
        <StatCard title="High Risk" value={highRisk.length} icon={ShieldAlert} trend={highRiskTrend} variant="danger" />
        <StatCard title="Critical Alerts" value={unresolvedAlerts.length} icon={AlertTriangle} trend={criticalAlertsTrend} variant="warning" />
        <StatCard title="Normal Monitoring" value={lowRisk.length} icon={HeartPulse} trend={normalMonitoringTrend} variant="success" />
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
