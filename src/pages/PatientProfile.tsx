import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Calendar, Droplets, Heart, Activity, FileText } from "lucide-react";
import { useStore } from "@/store/supabaseStore";
import { formatFollowUpDate, getRiskRecommendation } from "@/lib/patientUtils";
import { RiskGaugeCard } from "@/components/RiskGaugeCard";
import { UpdatePatientForm } from "@/components/UpdatePatientForm";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer,
} from "recharts";
import { useState } from "react";
import type { Patient } from "@/types";

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

  const getRec = (pct: number) => getRiskRecommendation(pct);
  const handleViewReport = () => {
    const reportWindow = window.open("", "_blank", "noopener,noreferrer,width=960,height=1080");

    if (!reportWindow) {
      return;
    }

    reportWindow.document.write(buildPatientReportHtml(patient));
    reportWindow.document.close();
    reportWindow.focus();
  };

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
          <div className="flex flex-col gap-3">
            <div className="flex flex-wrap gap-4 text-sm">
              <InfoPill icon={Calendar} label="Age" value={`${patient.age} yrs`} />
              <InfoPill icon={Droplets} label="Blood" value={patient.bloodGroup} />
              <InfoPill icon={Heart} label="Week" value={`${patient.pregnancyWeek}w`} />
              <InfoPill icon={Activity} label="HR" value={`${patient.heartRate} bpm`} />
            </div>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={handleViewReport}
                className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
              >
                <FileText className="h-4 w-4" />
                View Report
              </button>
              <UpdatePatientForm patient={patient} />
            </div>
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

function buildPatientReportHtml(patient: Patient) {
  const generatedAt = new Date().toLocaleString();
  const overallRisk = Math.round((patient.preeclampsiaRisk + patient.hypertensionRisk + patient.stressRisk) / 3);
  const symptoms = patient.symptoms.length > 0 ? patient.symptoms.map(escapeHtml).join(", ") : "No symptoms reported";
  const doctorNotes = patient.doctorNotes.trim() ? escapeHtml(patient.doctorNotes).replace(/\n/g, "<br />") : "No doctor notes recorded";

  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Patient Report - ${escapeHtml(patient.name)}</title>
    <style>
      :root {
        color-scheme: light;
        --ink: #14213d;
        --muted: #6b7280;
        --line: #d9e2ec;
        --panel: #f8fafc;
        --accent: #0f766e;
        --danger: #b91c1c;
      }
      * { box-sizing: border-box; }
      body {
        margin: 0;
        padding: 32px;
        font-family: "Segoe UI", Tahoma, sans-serif;
        color: var(--ink);
        background: white;
      }
      .report {
        max-width: 900px;
        margin: 0 auto;
      }
      .header {
        display: flex;
        justify-content: space-between;
        gap: 24px;
        border-bottom: 2px solid var(--ink);
        padding-bottom: 16px;
        margin-bottom: 24px;
      }
      .title {
        font-size: 28px;
        font-weight: 700;
        margin: 0 0 6px;
      }
      .subtitle, .meta {
        color: var(--muted);
        font-size: 13px;
        margin: 0;
      }
      .meta strong {
        color: var(--ink);
      }
      .section {
        margin-bottom: 24px;
      }
      .section h2 {
        font-size: 15px;
        letter-spacing: 0.04em;
        text-transform: uppercase;
        margin: 0 0 12px;
        color: var(--accent);
      }
      .grid {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 12px;
      }
      .card {
        background: var(--panel);
        border: 1px solid var(--line);
        border-radius: 10px;
        padding: 12px 14px;
      }
      .label {
        display: block;
        color: var(--muted);
        font-size: 12px;
        margin-bottom: 4px;
      }
      .value {
        font-size: 16px;
        font-weight: 600;
      }
      table {
        width: 100%;
        border-collapse: collapse;
      }
      th, td {
        border: 1px solid var(--line);
        padding: 10px 12px;
        text-align: left;
        font-size: 13px;
      }
      th {
        background: var(--panel);
        font-weight: 700;
      }
      .risk-high { color: var(--danger); }
      .notes {
        white-space: normal;
        line-height: 1.6;
      }
      .actions {
        display: flex;
        justify-content: flex-end;
        gap: 12px;
        margin: 24px 0 0;
      }
      .button {
        border: 0;
        border-radius: 999px;
        padding: 10px 16px;
        font-size: 13px;
        font-weight: 600;
        cursor: pointer;
      }
      .button-primary {
        color: white;
        background: var(--ink);
      }
      .button-secondary {
        color: var(--ink);
        background: #e5e7eb;
      }
      @media print {
        body { padding: 0; }
        .actions { display: none; }
      }
    </style>
  </head>
  <body>
    <div class="report">
      <div class="header">
        <div>
          <p class="title">Maternal Health Patient Report</p>
          <p class="subtitle">Generated clinical summary for ongoing monitoring and review.</p>
        </div>
        <div class="meta">
          <p><strong>Generated:</strong> ${escapeHtml(generatedAt)}</p>
          <p><strong>Patient ID:</strong> ${escapeHtml(patient.id)}</p>
          <p><strong>Follow-up:</strong> ${escapeHtml(formatFollowUpDate(patient.followUp))}</p>
        </div>
      </div>

      <section class="section">
        <h2>Patient Summary</h2>
        <div class="grid">
          ${renderCard("Name", patient.name)}
          ${renderCard("Age", `${patient.age} years`)}
          ${renderCard("Blood Group", patient.bloodGroup)}
          ${renderCard("Pregnancy Week", `${patient.pregnancyWeek} weeks`)}
          ${renderCard("Blood Pressure", patient.bloodPressure)}
          ${renderCard("Heart Rate", `${patient.heartRate} bpm`)}
          ${renderCard("Weight", `${patient.weightKg} kg`)}
          ${renderCard("BMI", `${patient.bmi}`)}
        </div>
      </section>

      <section class="section">
        <h2>Risk Assessment</h2>
        <table>
          <thead>
            <tr>
              <th>Metric</th>
              <th>Value</th>
            </tr>
          </thead>
          <tbody>
            <tr><td>Risk Level</td><td class="${patient.riskLevel === "High" ? "risk-high" : ""}">${escapeHtml(patient.riskLevel)}</td></tr>
            <tr><td>Overall Composite Risk</td><td>${overallRisk}%</td></tr>
            <tr><td>Preeclampsia Risk</td><td>${patient.preeclampsiaRisk}%</td></tr>
            <tr><td>Hypertension Risk</td><td>${patient.hypertensionRisk}%</td></tr>
            <tr><td>Maternal Stress Risk</td><td>${patient.stressRisk}%</td></tr>
          </tbody>
        </table>
      </section>

      <section class="section">
        <h2>Clinical Notes</h2>
        <div class="card notes">
          <p><span class="label">Symptoms</span><span class="value">${symptoms}</span></p>
          <p><span class="label">Doctor Notes</span><span>${doctorNotes}</span></p>
        </div>
      </section>

      <section class="section">
        <h2>Trend Snapshot</h2>
        <table>
          <thead>
            <tr>
              <th>Week</th>
              <th>Blood Pressure</th>
              <th>Weight (kg)</th>
              <th>Risk Score</th>
            </tr>
          </thead>
          <tbody>
            ${buildTrendRows(patient)}
          </tbody>
        </table>
      </section>

      <div class="actions">
        <button class="button button-secondary" onclick="window.close()">Close</button>
        <button class="button button-primary" onclick="window.print()">Download PDF</button>
      </div>
    </div>
  </body>
</html>`;
}

function renderCard(label: string, value: string) {
  return `<div class="card"><span class="label">${escapeHtml(label)}</span><span class="value">${escapeHtml(value)}</span></div>`;
}

function buildTrendRows(patient: Patient) {
  const weeks = new Set<number>([
    ...patient.bpHistory.map((item) => item.week),
    ...patient.weightHistory.map((item) => item.week),
    ...patient.riskHistory.map((item) => item.week),
  ]);

  return [...weeks]
    .sort((a, b) => a - b)
    .map((week) => {
      const bp = patient.bpHistory.find((item) => item.week === week);
      const weight = patient.weightHistory.find((item) => item.week === week);
      const risk = patient.riskHistory.find((item) => item.week === week);

      return `<tr>
        <td>${week}</td>
        <td>${bp ? `${bp.systolic}/${bp.diastolic}` : "-"}</td>
        <td>${weight ? weight.weight.toFixed(1) : "-"}</td>
        <td>${risk ? `${risk.score}%` : "-"}</td>
      </tr>`;
    })
    .join("");
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
