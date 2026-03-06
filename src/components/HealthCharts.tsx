import { useState } from "react";
import {
  LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend,
} from "recharts";
import { useStore } from "@/store";

export function BPTrendChart() {
  const { patients } = useStore();
  const [selectedId, setSelectedId] = useState(patients[0]?.id);
  const patient = patients.find((p) => p.id === selectedId);

  return (
    <div className="bg-card rounded-xl border border-border p-5 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-card-foreground">Blood Pressure Trend</h3>
        <select
          value={selectedId}
          onChange={(e) => setSelectedId(e.target.value)}
          className="text-xs bg-secondary text-secondary-foreground rounded-lg px-3 py-1.5 outline-none border-none"
        >
          {patients.map((p) => (
            <option key={p.id} value={p.id}>{p.name}</option>
          ))}
        </select>
      </div>
      <ResponsiveContainer width="100%" height={220}>
        <LineChart data={patient?.bpHistory ?? []}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(210 20% 91%)" />
          <XAxis dataKey="week" tick={{ fontSize: 11 }} tickFormatter={(w) => `W${w}`} />
          <YAxis tick={{ fontSize: 11 }} domain={[50, 170]} />
          <Tooltip contentStyle={{ borderRadius: 8, fontSize: 12 }} />
          <Legend wrapperStyle={{ fontSize: 12 }} />
          <Line type="monotone" dataKey="systolic" stroke="hsl(187 72% 38%)" strokeWidth={2} dot={{ r: 3 }} name="Systolic" />
          <Line type="monotone" dataKey="diastolic" stroke="hsl(262 52% 55%)" strokeWidth={2} dot={{ r: 3 }} name="Diastolic" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export function WeightChart() {
  const { patients } = useStore();
  const [selectedId, setSelectedId] = useState(patients[0]?.id);
  const patient = patients.find((p) => p.id === selectedId);

  return (
    <div className="bg-card rounded-xl border border-border p-5 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-card-foreground">Weight Gain</h3>
        <select
          value={selectedId}
          onChange={(e) => setSelectedId(e.target.value)}
          className="text-xs bg-secondary text-secondary-foreground rounded-lg px-3 py-1.5 outline-none border-none"
        >
          {patients.map((p) => (
            <option key={p.id} value={p.id}>{p.name}</option>
          ))}
        </select>
      </div>
      <ResponsiveContainer width="100%" height={220}>
        <LineChart data={patient?.weightHistory ?? []}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(210 20% 91%)" />
          <XAxis dataKey="week" tick={{ fontSize: 11 }} tickFormatter={(w) => `W${w}`} />
          <YAxis tick={{ fontSize: 11 }} />
          <Tooltip contentStyle={{ borderRadius: 8, fontSize: 12 }} />
          <Line type="monotone" dataKey="weight" stroke="hsl(152 60% 45%)" strokeWidth={2} dot={{ r: 3 }} name="Weight (kg)" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export function RiskScoreChart() {
  const { patients } = useStore();
  const [selectedId, setSelectedId] = useState(patients[0]?.id);
  const patient = patients.find((p) => p.id === selectedId);

  return (
    <div className="bg-card rounded-xl border border-border p-5 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-card-foreground">Risk Score Timeline</h3>
        <select
          value={selectedId}
          onChange={(e) => setSelectedId(e.target.value)}
          className="text-xs bg-secondary text-secondary-foreground rounded-lg px-3 py-1.5 outline-none border-none"
        >
          {patients.map((p) => (
            <option key={p.id} value={p.id}>{p.name}</option>
          ))}
        </select>
      </div>
      <ResponsiveContainer width="100%" height={220}>
        <AreaChart data={patient?.riskHistory ?? []}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(210 20% 91%)" />
          <XAxis dataKey="week" tick={{ fontSize: 11 }} tickFormatter={(w) => `W${w}`} />
          <YAxis tick={{ fontSize: 11 }} domain={[0, 100]} />
          <Tooltip contentStyle={{ borderRadius: 8, fontSize: 12 }} />
          <Area type="monotone" dataKey="score" stroke="hsl(0 72% 51%)" fill="hsl(0 72% 51% / 0.15)" strokeWidth={2} name="Risk Score" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
