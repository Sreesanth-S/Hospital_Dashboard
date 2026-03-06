import {
  PieChart, Pie, Cell, BarChart, Bar, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts";
import { useStore } from "@/store";

export function AnalyticsCharts() {
  const { patients } = useStore();

  const riskDist = [
    { name: "Low", value: patients.filter((p) => p.riskLevel === "Low").length, color: "hsl(152 60% 45%)" },
    { name: "Moderate", value: patients.filter((p) => p.riskLevel === "Moderate").length, color: "hsl(38 92% 50%)" },
    { name: "High", value: patients.filter((p) => p.riskLevel === "High").length, color: "hsl(0 72% 51%)" },
  ];

  const complications = [
    { name: "Preeclampsia", count: patients.filter((p) => p.preeclampsiaRisk > 50).length },
    { name: "Hypertension", count: patients.filter((p) => p.hypertensionRisk > 50).length },
    { name: "High Stress", count: patients.filter((p) => p.stressRisk > 50).length },
    { name: "High BP", count: patients.filter((p) => parseInt(p.bloodPressure) > 140).length },
  ];

  // avg BP by week buckets
  const weekBuckets = [
    { label: "12-16w", min: 12, max: 16 },
    { label: "17-22w", min: 17, max: 22 },
    { label: "23-28w", min: 23, max: 28 },
    { label: "29-34w", min: 29, max: 34 },
    { label: "35-40w", min: 35, max: 40 },
  ];
  const avgBP = weekBuckets.map((b) => {
    const inRange = patients.filter((p) => p.pregnancyWeek >= b.min && p.pregnancyWeek <= b.max);
    const avg = inRange.length > 0
      ? Math.round(inRange.reduce((s, p) => s + parseInt(p.bloodPressure), 0) / inRange.length)
      : 0;
    return { week: b.label, avgSystolic: avg };
  });

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
      <div className="bg-card rounded-xl border border-border p-5 shadow-sm">
        <h3 className="text-sm font-semibold text-card-foreground mb-4">Risk Distribution</h3>
        <ResponsiveContainer width="100%" height={200}>
          <PieChart>
            <Pie data={riskDist} cx="50%" cy="50%" innerRadius={45} outerRadius={75} dataKey="value" paddingAngle={4}>
              {riskDist.map((entry, i) => (
                <Cell key={i} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip contentStyle={{ borderRadius: 8, fontSize: 12 }} />
            <Legend wrapperStyle={{ fontSize: 12 }} />
          </PieChart>
        </ResponsiveContainer>
      </div>

      <div className="bg-card rounded-xl border border-border p-5 shadow-sm">
        <h3 className="text-sm font-semibold text-card-foreground mb-4">Common Complications</h3>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={complications}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(210 20% 91%)" />
            <XAxis dataKey="name" tick={{ fontSize: 10 }} />
            <YAxis tick={{ fontSize: 11 }} />
            <Tooltip contentStyle={{ borderRadius: 8, fontSize: 12 }} />
            <Bar dataKey="count" fill="hsl(187 72% 38%)" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="bg-card rounded-xl border border-border p-5 shadow-sm">
        <h3 className="text-sm font-semibold text-card-foreground mb-4">Avg BP by Gestational Age</h3>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={avgBP}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(210 20% 91%)" />
            <XAxis dataKey="week" tick={{ fontSize: 10 }} />
            <YAxis tick={{ fontSize: 11 }} />
            <Tooltip contentStyle={{ borderRadius: 8, fontSize: 12 }} />
            <Line type="monotone" dataKey="avgSystolic" stroke="hsl(187 72% 38%)" strokeWidth={2} dot={{ r: 3 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
