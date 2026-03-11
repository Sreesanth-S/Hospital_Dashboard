import { create } from "zustand";
import type { Patient, Alert, Notification, NotificationType } from "@/types";

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

// Utility function to calculate risk level from risk factors
function calculateRiskLevel(
  preeclampsiaRisk: number,
  hypertensionRisk: number,
  stressRisk: number
): Patient["riskLevel"] {
  const avgRisk = (preeclampsiaRisk + hypertensionRisk + stressRisk) / 3;
  return avgRisk > 55 ? "High" : avgRisk > 30 ? "Moderate" : "Low";
}

// Utility function to validate patient data ranges
function validatePatientData(data: Partial<Patient>): boolean {
  if (data.age !== undefined && (data.age < 16 || data.age > 55)) return false;
  if (data.pregnancyWeek !== undefined && (data.pregnancyWeek < 1 || data.pregnancyWeek > 42)) return false;
  if (data.weightKg !== undefined && (data.weightKg < 30 || data.weightKg > 200)) return false;
  if (data.heartRate !== undefined && (data.heartRate < 40 || data.heartRate > 120)) return false;
  if (data.preeclampsiaRisk !== undefined && (data.preeclampsiaRisk < 0 || data.preeclampsiaRisk > 100)) return false;
  if (data.hypertensionRisk !== undefined && (data.hypertensionRisk < 0 || data.hypertensionRisk > 100)) return false;
  if (data.stressRisk !== undefined && (data.stressRisk < 0 || data.stressRisk > 100)) return false;
  return true;
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
  const height = rand(155, 180);
  const bmi = baseWeight / ((height / 100) * (height / 100));
  
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
    heightCm: height,
    bmi: parseFloat(bmi.toFixed(1)),
    gravida: rand(1, 5),
    symptoms: Array.from({ length: rand(0, 3) }, () => symptomPool[rand(0, symptomPool.length - 1)]),
    headache: Math.random() > 0.7,
    swelling: {
      face: Math.random() > 0.85,
      hand: Math.random() > 0.85,
      feet: Math.random() > 0.75,
    },
    sleepHours: rand(5, 9),
    preeclampsiaHistory: Math.random() > 0.85,
    preeclampsiaFamilyHistory: Math.random() > 0.8,
    preeclampsiaFamilyRelationship: Math.random() > 0.8 ? ["Mother", "Sister", "Grandmother"][rand(0, 2)] : undefined,
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
  heightCm: number;
  systolic: number;
  diastolic: number;
  heartRate: number;
  gravida: number;
  sleepHours: number;
  headache: boolean;
  swelling: {
    face: boolean;
    hand: boolean;
    feet: boolean;
  };
  preeclampsiaHistory: boolean;
  preeclampsiaFamilyHistory: boolean;
  preeclampsiaFamilyRelationship?: string;
  symptoms: string[];
}

interface StoreState {
  patients: Patient[];
  alerts: Alert[];
  notifications: Notification[];
  selectedPatientId: string | null;
  searchQuery: string;
  setSelectedPatient: (id: string | null) => void;
  setSearchQuery: (q: string) => void;
  resolveAlert: (id: string) => void;
  addNotification: (type: NotificationType, title: string, message: string, patientId?: string, action?: { label: string; path?: string }) => void;
  markNotificationAsRead: (id: string) => void;
  dismissNotification: (id: string) => void;
  clearNotifications: () => void;
  updateDoctorNotes: (patientId: string, notes: string) => void;
  updatePatientVitals: (patientId: string, vitals: {
    bloodPressure?: string;
    heartRate?: number;
    weightKg?: number;
    symptoms?: string[];
    preeclampsiaRisk?: number;
    hypertensionRisk?: number;
    stressRisk?: number;
  }) => void;
  updatePatient: (patientId: string, input: NewPatientInput) => void;
  addPatient: (input: NewPatientInput) => void;
  deletePatient: (id: string) => void;
}

export const useStore = create<StoreState>((set) => ({
  patients,
  alerts,
  notifications: [],
  selectedPatientId: null,
  searchQuery: "",
  setSelectedPatient: (id) => set({ selectedPatientId: id }),
  setSearchQuery: (q) => set({ searchQuery: q }),
  resolveAlert: (id) =>
    set((s) => ({ alerts: s.alerts.map((a) => (a.id === id ? { ...a, resolved: true } : a)) })),
  
  addNotification: (type, title, message, patientId?, action?) =>
    set((s) => ({
      notifications: [{
        id: `N-${Date.now()}`,
        type,
        title,
        message,
        timestamp: new Date().toISOString(),
        read: false,
        patientId,
        action,
      }, ...s.notifications],
    })),
  
  markNotificationAsRead: (id) =>
    set((s) => ({
      notifications: s.notifications.map((n) =>
        n.id === id ? { ...n, read: true } : n
      ),
    })),
  
  dismissNotification: (id) =>
    set((s) => ({
      notifications: s.notifications.filter((n) => n.id !== id),
    })),
  
  clearNotifications: () =>
    set({ notifications: [] }),
  
  // Updated updateDoctorNotes to also update lastUpdated timestamp
  updateDoctorNotes: (patientId, notes) =>
    set((s) => ({
      patients: s.patients.map((p) =>
        p.id === patientId
          ? { ...p, doctorNotes: notes, lastUpdated: new Date().toISOString() }
          : p
      ),
    })),
  
  // New comprehensive function to update patient vitals with validation and consistency
  updatePatientVitals: (patientId, vitals) =>
    set((s) => {
      const patient = s.patients.find((p) => p.id === patientId);
      if (!patient) return s;

      // Validate all provided data
      if (!validatePatientData(vitals)) {
        console.warn("Invalid patient data - validation failed");
        return s;
      }

      // Build updated patient object
      const updatedPatient = { ...patient, ...vitals, lastUpdated: new Date().toISOString() };

      // Recalculate risk level if any risk factors changed
      if (
        vitals.preeclampsiaRisk !== undefined ||
        vitals.hypertensionRisk !== undefined ||
        vitals.stressRisk !== undefined
      ) {
        updatedPatient.riskLevel = calculateRiskLevel(
          vitals.preeclampsiaRisk ?? patient.preeclampsiaRisk,
          vitals.hypertensionRisk ?? patient.hypertensionRisk,
          vitals.stressRisk ?? patient.stressRisk
        );
      }

      // Update alerts based on new risk level
      let updatedAlerts = s.alerts;
      let notificationsToAdd: Notification[] = [];
      const existingAlert = s.alerts.find((a) => a.patientId === patientId && !a.resolved);
      
      // Check if risk level changed
      const riskChanged = updatedPatient.riskLevel !== patient.riskLevel;
      
      if (updatedPatient.riskLevel === "High") {
        if (!existingAlert) {
          // Create alert for newly high-risk patient
          const sys = parseInt(updatedPatient.bloodPressure.split("/")[0]);
          const newAlert: Alert = {
            id: `A-${Date.now()}`,
            patientId,
            patientName: updatedPatient.name,
            pregnancyWeek: updatedPatient.pregnancyWeek,
            issue: sys > 140
              ? `BP ${updatedPatient.bloodPressure} exceeds threshold`
              : `High composite risk score (${Math.round((updatedPatient.preeclampsiaRisk + updatedPatient.hypertensionRisk) / 2)}%)`,
            timestamp: new Date().toISOString(),
            resolved: false,
          };
          updatedAlerts = [...s.alerts, newAlert];
        }
        
        if (riskChanged) {
          notificationsToAdd.push({
            id: `N-${Date.now()}`,
            type: "alert",
            title: "Risk Level Escalated",
            message: `${updatedPatient.name} has been escalated to High risk. Immediate attention required.`,
            timestamp: new Date().toISOString(),
            read: false,
            patientId,
            action: { label: "View Patient", path: `/patient/${patientId}` },
          });
        }
      } else if (existingAlert && updatedPatient.riskLevel !== "High") {
        // Resolve alert if risk dropped below High
        updatedAlerts = updatedAlerts.map((a) =>
          a.id === existingAlert.id ? { ...a, resolved: true } : a
        );
        
        if (riskChanged) {
          notificationsToAdd.push({
            id: `N-${Date.now()}`,
            type: "success",
            title: "Risk Level Improved",
            message: `${updatedPatient.name}'s risk level has improved to ${updatedPatient.riskLevel}.`,
            timestamp: new Date().toISOString(),
            read: false,
            patientId,
            action: { label: "View Patient", path: `/patient/${patientId}` },
          });
        }
      } else if (!riskChanged) {
        // Simple vitals update notification
        notificationsToAdd.push({
          id: `N-${Date.now()}`,
          type: "info",
          title: "Vitals Updated",
          message: `${updatedPatient.name}'s vital signs have been recorded.`,
          timestamp: new Date().toISOString(),
          read: false,
          patientId,
        });
      }

      return {
        patients: s.patients.map((p) => (p.id === patientId ? updatedPatient : p)),
        alerts: updatedAlerts,
        notifications: [...notificationsToAdd, ...s.notifications],
      };
    }),

  addPatient: (input) =>
    set((s) => {
      const id = `P-${String(s.patients.length + 1).padStart(3, "0")}`;
      
      // Calculate BMI from height and weight
      const heightM = input.heightCm / 100;
      const bmi = input.weightKg / (heightM * heightM);
      
      // Adjust risk factors based on medical data
      let preeclampsia = rand(5, 30);
      let hypertension = rand(5, 25);
      let stress = rand(10, 30);
      
      // Increase risk if patient has preeclampsia history
      if (input.preeclampsiaHistory) {
        preeclampsia += 20;
      }
      
      // Increase risk if family history of preeclampsia
      if (input.preeclampsiaFamilyHistory) {
        preeclampsia += 15;
      }
      
      // Increase hypertension risk if high BP
      if (input.systolic > 140 || input.diastolic > 90) {
        hypertension += 20;
      }
      
      // Increase stress risk if low sleep
      if (input.sleepHours < 6) {
        stress += 15;
      }
      
      // Clamp values to 0-100
      preeclampsia = Math.min(100, Math.max(0, preeclampsia));
      hypertension = Math.min(100, Math.max(0, hypertension));
      stress = Math.min(100, Math.max(0, stress));
      
      const riskLevel = calculateRiskLevel(preeclampsia, hypertension, stress);
      const avgRisk = (preeclampsia + hypertension + stress) / 3;
      
      const newPatient: Patient = {
        id,
        name: input.name,
        age: input.age,
        bloodGroup: input.bloodGroup,
        pregnancyWeek: input.pregnancyWeek,
        bloodPressure: `${input.systolic}/${input.diastolic}`,
        heartRate: input.heartRate,
        riskLevel,
        lastUpdated: new Date().toISOString(),
        weightKg: input.weightKg,
        heightCm: input.heightCm,
        bmi: parseFloat(bmi.toFixed(1)),
        gravida: input.gravida,
        headache: input.headache,
        swelling: input.swelling,
        sleepHours: input.sleepHours,
        preeclampsiaHistory: input.preeclampsiaHistory,
        preeclampsiaFamilyHistory: input.preeclampsiaFamilyHistory,
        preeclampsiaFamilyRelationship: input.preeclampsiaFamilyRelationship,
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

      let newAlerts = [...s.alerts];
      if (riskLevel === "High") {
        newAlerts.push({
          id: `A-${Date.now()}`,
          patientId: id,
          patientName: newPatient.name,
          pregnancyWeek: newPatient.pregnancyWeek,
          issue: input.systolic > 140
            ? `BP ${newPatient.bloodPressure} exceeds threshold`
            : `High composite risk score (${Math.round((preeclampsia + hypertension) / 2)}%)`,
          timestamp: new Date().toISOString(),
          resolved: false,
        });
      }

      return { 
        patients: [...s.patients, newPatient],
        alerts: newAlerts,
        notifications: [{
          id: `N-${Date.now()}`,
          type: riskLevel === "High" ? "alert" : "success",
          title: "Patient Added",
          message: `${newPatient.name} has been registered with ${riskLevel} risk level`,
          timestamp: new Date().toISOString(),
          read: false,
          patientId: id,
          action: { label: "View Profile", path: `/patient/${id}` },
        }, ...s.notifications],
      };
    }),

  updatePatient: (patientId, input) =>
    set((s) => {
      const existingPatient = s.patients.find((p) => p.id === patientId);
      if (!existingPatient) return s;
      
      // Calculate BMI from height and weight
      const heightM = input.heightCm / 100;
      const bmi = input.weightKg / (heightM * heightM);
      
      // Adjust risk factors based on medical data
      let preeclampsia = rand(5, 30);
      let hypertension = rand(5, 25);
      let stress = rand(10, 30);
      
      // Increase risk if patient has preeclampsia history
      if (input.preeclampsiaHistory) {
        preeclampsia += 20;
      }
      
      // Increase risk if family history of preeclampsia
      if (input.preeclampsiaFamilyHistory) {
        preeclampsia += 15;
      }
      
      // Increase hypertension risk if high BP
      if (input.systolic > 140 || input.diastolic > 90) {
        hypertension += 20;
      }
      
      // Increase stress risk if low sleep
      if (input.sleepHours < 6) {
        stress += 15;
      }
      
      // Clamp values to 0-100
      preeclampsia = Math.min(100, Math.max(0, preeclampsia));
      hypertension = Math.min(100, Math.max(0, hypertension));
      stress = Math.min(100, Math.max(0, stress));
      
      const riskLevel = calculateRiskLevel(preeclampsia, hypertension, stress);
      
      const updatedPatient: Patient = {
        ...existingPatient,
        name: input.name,
        age: input.age,
        bloodGroup: input.bloodGroup,
        pregnancyWeek: input.pregnancyWeek,
        bloodPressure: `${input.systolic}/${input.diastolic}`,
        heartRate: input.heartRate,
        riskLevel,
        lastUpdated: new Date().toISOString(),
        weightKg: input.weightKg,
        heightCm: input.heightCm,
        bmi: parseFloat(bmi.toFixed(1)),
        gravida: input.gravida,
        headache: input.headache,
        swelling: input.swelling,
        sleepHours: input.sleepHours,
        preeclampsiaHistory: input.preeclampsiaHistory,
        preeclampsiaFamilyHistory: input.preeclampsiaFamilyHistory,
        preeclampsiaFamilyRelationship: input.preeclampsiaFamilyRelationship,
        symptoms: input.symptoms,
        preeclampsiaRisk: preeclampsia,
        hypertensionRisk: hypertension,
        stressRisk: stress,
      };
      
      // Update alerts based on new risk level
      let updatedAlerts = s.alerts;
      let notificationsToAdd: Notification[] = [];
      const existingAlert = s.alerts.find((a) => a.patientId === patientId && !a.resolved);
      const riskChanged = updatedPatient.riskLevel !== existingPatient.riskLevel;
      
      if (updatedPatient.riskLevel === "High") {
        if (!existingAlert) {
          const sys = input.systolic;
          const newAlert: Alert = {
            id: `A-${Date.now()}`,
            patientId,
            patientName: updatedPatient.name,
            pregnancyWeek: updatedPatient.pregnancyWeek,
            issue: sys > 140
              ? `BP ${updatedPatient.bloodPressure} exceeds threshold`
              : `High composite risk score (${Math.round((preeclampsia + hypertension) / 2)}%)`,
            timestamp: new Date().toISOString(),
            resolved: false,
          };
          updatedAlerts = [...s.alerts, newAlert];
        }
        
        if (riskChanged) {
          notificationsToAdd.push({
            id: `N-${Date.now()}`,
            type: "alert",
            title: "Risk Level Escalated",
            message: `${updatedPatient.name} has been escalated to High risk during update.`,
            timestamp: new Date().toISOString(),
            read: false,
            patientId,
            action: { label: "View Patient", path: `/patient/${patientId}` },
          });
        }
      } else if (existingAlert && updatedPatient.riskLevel !== "High") {
        // Resolve alert if risk dropped below High
        updatedAlerts = updatedAlerts.map((a) =>
          a.id === existingAlert.id ? { ...a, resolved: true } : a
        );
        
        if (riskChanged) {
          notificationsToAdd.push({
            id: `N-${Date.now()}`,
            type: "success",
            title: "Risk Level Improved",
            message: `${updatedPatient.name}'s risk level has improved to ${updatedPatient.riskLevel}.`,
            timestamp: new Date().toISOString(),
            read: false,
            patientId,
            action: { label: "View Patient", path: `/patient/${patientId}` },
          });
        }
      }
      
      // Add profile update notification
      if (!riskChanged) {
        notificationsToAdd.push({
          id: `N-${Date.now()}`,
          type: "info",
          title: "Patient Profile Updated",
          message: `${updatedPatient.name}'s profile has been updated.`,
          timestamp: new Date().toISOString(),
          read: false,
          patientId,
          action: { label: "View Patient", path: `/patient/${patientId}` },
        });
      }
      
      return {
        patients: s.patients.map((p) => (p.id === patientId ? updatedPatient : p)),
        alerts: updatedAlerts,
        notifications: [...notificationsToAdd, ...s.notifications],
      };
    }),

  deletePatient: (id) =>
    set((s) => ({
      patients: s.patients.filter((p) => p.id !== id),
      alerts: s.alerts.filter((a) => a.patientId !== id),
    })),
}));
