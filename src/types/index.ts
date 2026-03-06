export type RiskLevel = "Low" | "Moderate" | "High";

export interface Patient {
  id: string;
  name: string;
  age: number;
  bloodGroup: string;
  pregnancyWeek: number;
  bloodPressure: string;
  heartRate: number;
  riskLevel: RiskLevel;
  lastUpdated: string;
  weightKg: number;
  symptoms: string[];
  preeclampsiaRisk: number;
  hypertensionRisk: number;
  stressRisk: number;
  bpHistory: { week: number; systolic: number; diastolic: number }[];
  weightHistory: { week: number; weight: number }[];
  riskHistory: { week: number; score: number }[];
  doctorNotes: string;
  followUp: string;
}

export interface Alert {
  id: string;
  patientId: string;
  patientName: string;
  pregnancyWeek: number;
  issue: string;
  timestamp: string;
  resolved: boolean;
}
