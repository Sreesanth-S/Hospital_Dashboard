import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Calendar, Droplets, Heart, Activity } from "lucide-react";
import { useStore } from "@/store";
import { RiskGaugeCard } from "@/components/RiskGaugeCard";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer,
} from "recharts";
import { useState } from "react";

export default function PatientProfile() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { patients, updateDoctorNotes } = useStore();
  const patient = patients.find((p) => p.id === id);
  const [notes, setNotes] = useState(patient?.doctorNotes ?? "");

  if (!patient) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Patient not found</p>
      </div>
    );
  }

  const getRec = (pct: number) =>
    pct > 65 ? "Immediate clinical evaluation recommended." : pct > 35 ? "Schedule follow-up within 48 hours." : "Continue routine monitoring.";

  return (
    <div className="space-y-6">
      <button
        onClick={() => navigate(-1)}
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Back
      </button>

      {/* Header */}
      <div className="bg-card rounded-xl border border-border p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-primary flex items-center justify-center text-xl font-bold text-primary-foreground">
              {patient.name.split(" ").map((n) => n[0]).join("")}
            </div>
            <div>
              <h2 className="text-xl font-bold text-card-foreground">{patient.name}</h2>
              <p className="text-sm text-muted-foreground">ID: {patient.id}</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-4 text-sm">
            <InfoPill icon={Calendar} label="Age" value={`${patient.age} yrs`} />
            <InfoPill icon={Droplets} label="Blood" value={patient.bloodGroup} />
            <InfoPill icon={Heart} label="Week" value={`${patient.pregnancyWeek}w`} />
            <InfoPill icon={Activity} label="HR" value={`${patient.heartRate} bpm`} />
          </div>
        </div>
      </div>

      {/* Risk Assessment */}
      <div>
        <h3 className="text-lg font-semibold text-foreground mb-3">AI Risk Assessment</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <RiskGaugeCard patientName={patient.name} label="Preeclampsia" percentage={patient.preeclampsiaRisk} recommendation={getRec(patient.preeclampsiaRisk)} />
          <RiskGaugeCard patientName={patient.name} label="Hypertension" percentage={patient.hypertensionRisk} recommendation={getRec(patient.hypertensionRisk)} />
          <RiskGaugeCard patientName={patient.name} label="Maternal Stress" percentage={patient.stressRisk} recommendation={getRec(patient.stressRisk)} />
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-card rounded-xl border border-border p-5 shadow-sm">
          <h3 className="text-sm font-semibold text-card-foreground mb-4">BP History</h3>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={patient.bpHistory}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(210 20% 91%)" />
              <XAxis dataKey="week" tick={{ fontSize: 11 }} tickFormatter={(w) => `W${w}`} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip contentStyle={{ borderRadius: 8, fontSize: 12 }} />
              <Line type="monotone" dataKey="systolic" stroke="hsl(187 72% 38%)" strokeWidth={2} dot={{ r: 3 }} />
              <Line type="monotone" dataKey="diastolic" stroke="hsl(262 52% 55%)" strokeWidth={2} dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="bg-card rounded-xl border border-border p-5 shadow-sm">
          <h3 className="text-sm font-semibold text-card-foreground mb-4">Weight Trend</h3>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={patient.weightHistory}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(210 20% 91%)" />
              <XAxis dataKey="week" tick={{ fontSize: 11 }} tickFormatter={(w) => `W${w}`} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip contentStyle={{ borderRadius: 8, fontSize: 12 }} />
              <Line type="monotone" dataKey="weight" stroke="hsl(152 60% 45%)" strokeWidth={2} dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Symptoms & Notes */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-card rounded-xl border border-border p-5 shadow-sm">
          <h3 className="text-sm font-semibold text-card-foreground mb-3">Symptoms Log</h3>
          {patient.symptoms.length === 0 ? (
            <p className="text-xs text-muted-foreground">No symptoms reported</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {patient.symptoms.map((s, i) => (
                <span key={i} className="px-3 py-1 rounded-full bg-secondary text-secondary-foreground text-xs font-medium">
                  {s}
                </span>
              ))}
            </div>
          )}
        </div>

        <div className="bg-card rounded-xl border border-border p-5 shadow-sm">
          <h3 className="text-sm font-semibold text-card-foreground mb-3">Doctor Notes</h3>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            onBlur={() => updateDoctorNotes(patient.id, notes)}
            className="w-full h-24 text-sm bg-secondary text-secondary-foreground rounded-lg p-3 outline-none resize-none focus:ring-2 focus:ring-ring"
            placeholder="Add clinical notes..."
          />
          <p className="text-xs text-muted-foreground mt-2">
            Follow-up: <span className="font-medium text-foreground">{patient.followUp}</span>
          </p>
        </div>
      </div>
    </div>
  );
}

function InfoPill({ icon: Icon, label, value }: { icon: React.ComponentType<{ className?: string }>; label: string; value: string }) {
  return (
    <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-secondary">
      <Icon className="w-4 h-4 text-primary" />
      <div>
        <p className="text-[11px] text-muted-foreground leading-none">{label}</p>
        <p className="text-sm font-semibold text-secondary-foreground">{value}</p>
      </div>
    </div>
  );
}
