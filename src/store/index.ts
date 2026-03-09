import { create } from "zustand";
import type { Patient, Alert } from "@/types";

const names = [
  "Amara Johnson", "Fatima Al-Hassan", "Priya Sharma", "Sofia Martinez",
  "Chen Wei Lin", "Olivia Thompson", "Aisha Okafor", "Maria Santos",
  "Yuki Tanaka", "Elena Petrov", "Sarah Williams", "Nadia Benali",
  "Grace Mbeki", "Lina Johansson", "Mei Huang"
];

const bloodGroups = ["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"];
const symptomPool = ["Headache", "Swelling", "Fatigue", "Nausea", "Blurred vision", "Dizziness", "Chest pain", "Shortness of breath"];

function rand(min: number, max: number) { return Math.floor(Math.random() * (max - min + 1)) + min; }

function genBpHistory(weeks: number) {
  const arr = [];
  for (let w = 8; w <= weeks; w += 2) {
    arr.push({ week: w, systolic: rand(110, 155), diastolic: rand(65, 100) });
  }
  return arr;
}

function genWeightHistory(weeks: number, base: number) {
  const arr = [];
  for (let w = 8; w <= weeks; w += 2) {
    arr.push({ week: w, weight: +(base + (w - 8) * 0.4 + Math.random() * 2).toFixed(1) });
  }
  return arr;
}

function genRiskHistory(weeks: number, baseRisk: number) {
  const arr = [];
  for (let w = 8; w <= weeks; w += 2) {
    arr.push({ week: w, score: Math.min(100, Math.max(5, baseRisk + rand(-15, 15))) });
  }
  return arr;
}

const patients: Patient[] = names.map((name, i) => {
  const age = rand(22, 40);
  const week = rand(12, 38);
  const sys = rand(110, 155);
  const dia = rand(65, 100);
  const preeclampsia = rand(5, 92);
  const hypertension = rand(5, 88);
  const stress = rand(10, 75);
  const avgRisk = (preeclampsia + hypertension + stress) / 3;
  const riskLevel = avgRisk > 55 ? "High" : avgRisk > 30 ? "Moderate" : "Low";
  const baseWeight = rand(55, 80);
  return {
    id: `P-${String(i + 1).padStart(3, "0")}`,
    name, age,
    bloodGroup: bloodGroups[rand(0, 7)],
    pregnancyWeek: week,
    bloodPressure: `${sys}/${dia}`,
    heartRate: rand(68, 105),
    riskLevel: riskLevel as Patient["riskLevel"],
    lastUpdated: new Date(Date.now() - rand(0, 72) * 3600000).toISOString(),
    weightKg: baseWeight,
    symptoms: Array.from({ length: rand(0, 3) }, () => symptomPool[rand(0, symptomPool.length - 1)]),
    preeclampsiaRisk: preeclampsia,
    hypertensionRisk: hypertension,
    stressRisk: stress,
    bpHistory: genBpHistory(week),
    weightHistory: genWeightHistory(week, baseWeight),
    riskHistory: genRiskHistory(week, Math.round(avgRisk)),
    doctorNotes: "",
    followUp: new Date(Date.now() + rand(1, 14) * 86400000).toISOString().split("T")[0],
  };
});

const alerts: Alert[] = patients
  .filter((p) => p.riskLevel === "High")
  .map((p, i) => ({
    id: `A-${String(i + 1).padStart(3, "0")}`,
    patientId: p.id,
    patientName: p.name,
    pregnancyWeek: p.pregnancyWeek,
    issue: parseInt(p.bloodPressure) > 140 ? `BP ${p.bloodPressure} exceeds threshold` : `High composite risk score (${Math.round((p.preeclampsiaRisk + p.hypertensionRisk) / 2)}%)`,
    timestamp: new Date(Date.now() - rand(0, 24) * 3600000).toISOString(),
    resolved: false,
  }));

interface NewPatientInput {
  name: string;
  age: number;
  bloodGroup: string;
  pregnancyWeek: number;
  weightKg: number;
  symptoms: string[];
}

interface StoreState {
  patients: Patient[];
  alerts: Alert[];
  selectedPatientId: string | null;
  searchQuery: string;
  setSelectedPatient: (id: string | null) => void;
  setSearchQuery: (q: string) => void;
  resolveAlert: (id: string) => void;
  updateDoctorNotes: (patientId: string, notes: string) => void;
  addPatient: (input: NewPatientInput) => void;
  deletePatient: (id: string) => void;
}

export const useStore = create<StoreState>((set) => ({
  patients,
  alerts,
  selectedPatientId: null,
  searchQuery: "",
  setSelectedPatient: (id) => set({ selectedPatientId: id }),
  setSearchQuery: (q) => set({ searchQuery: q }),
  resolveAlert: (id) =>
    set((s) => ({ alerts: s.alerts.map((a) => (a.id === id ? { ...a, resolved: true } : a)) })),
  updateDoctorNotes: (patientId, notes) =>
    set((s) => ({ patients: s.patients.map((p) => (p.id === patientId ? { ...p, doctorNotes: notes } : p)) })),
  addPatient: (input) =>
    set((s) => {
      const id = `P-${String(s.patients.length + 1).padStart(3, "0")}`;
      const sys = rand(110, 135);
      const dia = rand(65, 85);
      const preeclampsia = rand(5, 30);
      const hypertension = rand(5, 25);
      const stress = rand(10, 30);
      const avgRisk = (preeclampsia + hypertension + stress) / 3;
      const riskLevel = avgRisk > 55 ? "High" : avgRisk > 30 ? "Moderate" : "Low";
      const newPatient: Patient = {
        id,
        name: input.name,
        age: input.age,
        bloodGroup: input.bloodGroup,
        pregnancyWeek: input.pregnancyWeek,
        bloodPressure: `${sys}/${dia}`,
        heartRate: rand(68, 95),
        riskLevel: riskLevel as Patient["riskLevel"],
        lastUpdated: new Date().toISOString(),
        weightKg: input.weightKg,
        symptoms: input.symptoms,
        preeclampsiaRisk: preeclampsia,
        hypertensionRisk: hypertension,
        stressRisk: stress,
        bpHistory: genBpHistory(input.pregnancyWeek),
        weightHistory: genWeightHistory(input.pregnancyWeek, input.weightKg),
        riskHistory: genRiskHistory(input.pregnancyWeek, Math.round(avgRisk)),
        doctorNotes: "",
        followUp: new Date(Date.now() + rand(1, 14) * 86400000).toISOString().split("T")[0],
      };
      return { patients: [...s.patients, newPatient] };
    }),
  deletePatient: (id) =>
    set((s) => ({
      patients: s.patients.filter((p) => p.id !== id),
      alerts: s.alerts.filter((a) => a.patientId !== id),
    })),
}));
