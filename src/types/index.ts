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
  heightCm: number;
  bmi: number;
  gravida: number;
  symptoms: string[];
  headache: boolean;
  swelling: {
    face: boolean;
    hand: boolean;
    feet: boolean;
  };
  sleepHours: number;
  preeclampsiaHistory: boolean;
  preeclampsiaFamilyHistory: boolean;
  preeclampsiaFamilyRelationship?: string;
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

export type NotificationType = "alert" | "info" | "warning" | "success";

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  patientId?: string;
  action?: {
    label: string;
    path?: string;
  };
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: "admin" | "doctor" | "nurse";
  specialization?: string;
  hospitalName?: string;
}
