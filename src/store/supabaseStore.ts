import { create } from "zustand";
import type { Patient, Alert, Notification, NotificationType } from "@/types";
import { patientService } from "@/lib/services/patientService";
import { alertService } from "@/lib/services/alertService";
import { notificationService } from "@/lib/services/notificationService";

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

function rand(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

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

function calculateRiskLevel(
  preeclampsiaRisk: number,
  hypertensionRisk: number,
  stressRisk: number
): Patient["riskLevel"] {
  const avgRisk = (preeclampsiaRisk + hypertensionRisk + stressRisk) / 3;
  return avgRisk > 55 ? "High" : avgRisk > 30 ? "Moderate" : "Low";
}

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

interface StoreState {
  patients: Patient[];
  alerts: Alert[];
  notifications: Notification[];
  selectedPatientId: string | null;
  searchQuery: string;
  isLoading: boolean;
  error: string | null;
  
  // Data fetching
  fetchAllPatients: () => Promise<void>;
  fetchAllAlerts: () => Promise<void>;
  fetchAllNotifications: () => Promise<void>;
  initializeData: () => Promise<void>;
  
  // UI State
  setSelectedPatient: (id: string | null) => void;
  setSearchQuery: (q: string) => void;
  
  // Notifications
  addNotification: (type: NotificationType, title: string, message: string, patientId?: string, action?: { label: string; path?: string }) => Promise<void>;
  markNotificationAsRead: (id: string) => Promise<void>;
  dismissNotification: (id: string) => Promise<void>;
  clearNotifications: () => Promise<void>;
  
  // Alerts
  resolveAlert: (id: string) => Promise<void>;
  
  // Patient operations
  updateDoctorNotes: (patientId: string, notes: string) => Promise<void>;
  updatePatientVitals: (patientId: string, vitals: {
    bloodPressure?: string;
    heartRate?: number;
    weightKg?: number;
    symptoms?: string[];
    preeclampsiaRisk?: number;
    hypertensionRisk?: number;
    stressRisk?: number;
  }) => Promise<void>;
  updatePatient: (patientId: string, input: NewPatientInput) => Promise<void>;
  addPatient: (input: NewPatientInput) => Promise<void>;
  deletePatient: (id: string) => Promise<void>;
}

export const useStore = create<StoreState>((set, get) => ({
  patients: [],
  alerts: [],
  notifications: [],
  selectedPatientId: null,
  searchQuery: "",
  isLoading: false,
  error: null,

  // Fetch all patients from Supabase
  fetchAllPatients: async () => {
    try {
      set({ isLoading: true, error: null });
      const patients = await patientService.fetchAllPatients();
      set({ patients, isLoading: false });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to fetch patients";
      set({ error: message, isLoading: false });
      console.error("Error fetching patients:", error);
    }
  },

  // Fetch all alerts from Supabase
  fetchAllAlerts: async () => {
    try {
      const alerts = await alertService.fetchAllAlerts();
      set({ alerts });
    } catch (error) {
      console.error("Error fetching alerts:", error);
    }
  },

  // Fetch all notifications from Supabase
  fetchAllNotifications: async () => {
    try {
      const notifications = await notificationService.fetchAllNotifications();
      set({ notifications });
    } catch (error) {
      console.error("Error fetching notifications:", error);
    }
  },

  // Initialize all data
  initializeData: async () => {
    await Promise.all([
      get().fetchAllPatients(),
      get().fetchAllAlerts(),
      get().fetchAllNotifications(),
    ]);
  },

  setSelectedPatient: (id) => set({ selectedPatientId: id }),
  setSearchQuery: (q) => set({ searchQuery: q }),

  // Add notification
  addNotification: async (type, title, message, patientId?, action?) => {
    try {
      const newNotification = await notificationService.createNotification({
        type,
        title,
        message,
        timestamp: new Date().toISOString(),
        read: false,
        patientId,
        action,
      });
      set((s) => ({
        notifications: [newNotification, ...s.notifications],
      }));
    } catch (error) {
      console.error("Error adding notification:", error);
    }
  },

  // Mark notification as read
  markNotificationAsRead: async (id) => {
    try {
      const updated = await notificationService.markAsRead(id);
      set((s) => ({
        notifications: s.notifications.map((n) =>
          n.id === id ? updated : n
        ),
      }));
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  },

  // Dismiss notification
  dismissNotification: async (id) => {
    try {
      await notificationService.deleteNotification(id);
      set((s) => ({
        notifications: s.notifications.filter((n) => n.id !== id),
      }));
    } catch (error) {
      console.error("Error dismissing notification:", error);
    }
  },

  // Clear all notifications
  clearNotifications: async () => {
    try {
      // Delete all unread notifications
      await notificationService.markAllAsRead();
      set({ notifications: [] });
    } catch (error) {
      console.error("Error clearing notifications:", error);
    }
  },

  // Resolve alert
  resolveAlert: async (id) => {
    try {
      const updated = await alertService.updateAlert(id, { resolved: true });
      set((s) => ({
        alerts: s.alerts.map((a) => (a.id === id ? updated : a)),
      }));
    } catch (error) {
      console.error("Error resolving alert:", error);
    }
  },

  // Update doctor notes
  updateDoctorNotes: async (patientId, notes) => {
    try {
      const updated = await patientService.updatePatient(patientId, {
        doctorNotes: notes,
        lastUpdated: new Date().toISOString(),
      });
      set((s) => ({
        patients: s.patients.map((p) =>
          p.id === patientId ? { ...p, ...updated } : p
        ),
      }));
    } catch (error) {
      console.error("Error updating doctor notes:", error);
    }
  },

  // Update patient vitals
  updatePatientVitals: async (patientId, vitals) => {
    try {
      const patient = get().patients.find((p) => p.id === patientId);
      if (!patient) return;

      if (!validatePatientData(vitals)) {
        console.warn("Invalid patient data - validation failed");
        return;
      }

      const updatedPatient = { ...patient, ...vitals, lastUpdated: new Date().toISOString() };

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

      // Save to Supabase
      await patientService.updatePatient(patientId, updatedPatient);

      let notificationsToAdd: Notification[] = [];
      const existingAlert = get().alerts.find((a) => a.patientId === patientId && !a.resolved);
      const riskChanged = updatedPatient.riskLevel !== patient.riskLevel;

      if (updatedPatient.riskLevel === "High") {
        if (!existingAlert) {
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
          await alertService.createAlert(newAlert);
          set((s) => ({ alerts: [...s.alerts, newAlert] }));
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
      } else if (existingAlert) {
        await alertService.updateAlert(existingAlert.id, { resolved: true });
        set((s) => ({
          alerts: s.alerts.map((a) =>
            a.id === existingAlert.id ? { ...a, resolved: true } : a
          ),
        }));

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

      // Save notifications
      for (const notif of notificationsToAdd) {
        await notificationService.createNotification(notif);
      }

      set((s) => ({
        patients: s.patients.map((p) => (p.id === patientId ? updatedPatient : p)),
        notifications: [...notificationsToAdd, ...s.notifications],
      }));
    } catch (error) {
      console.error("Error updating patient vitals:", error);
    }
  },

  // Add patient
  addPatient: async (input) => {
    try {
      const heightM = input.heightCm / 100;
      const bmi = input.weightKg / (heightM * heightM);

      let preeclampsia = rand(5, 30);
      let hypertension = rand(5, 25);
      let stress = rand(10, 30);

      if (input.preeclampsiaHistory) {
        preeclampsia += 20;
      }
      if (input.preeclampsiaFamilyHistory) {
        preeclampsia += 15;
      }
      if (input.systolic > 140 || input.diastolic > 90) {
        hypertension += 20;
      }
      if (input.sleepHours < 6) {
        stress += 15;
      }

      preeclampsia = Math.min(100, Math.max(0, preeclampsia));
      hypertension = Math.min(100, Math.max(0, hypertension));
      stress = Math.min(100, Math.max(0, stress));

      const riskLevel = calculateRiskLevel(preeclampsia, hypertension, stress);
      const avgRisk = (preeclampsia + hypertension + stress) / 3;

      const newPatient: Patient = {
        id: `P-${Date.now()}`,
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

      // Save to Supabase
      const savedPatient = await patientService.createPatient(newPatient);

      let newAlerts: Alert[] = [];
      if (riskLevel === "High") {
        const newAlert: Alert = {
          id: `A-${Date.now()}`,
          patientId: savedPatient.id,
          patientName: savedPatient.name,
          pregnancyWeek: savedPatient.pregnancyWeek,
          issue: input.systolic > 140
            ? `BP ${savedPatient.bloodPressure} exceeds threshold`
            : `High composite risk score (${Math.round((preeclampsia + hypertension) / 2)}%)`,
          timestamp: new Date().toISOString(),
          resolved: false,
        };
        newAlerts = [await alertService.createAlert(newAlert)];
      }

      const notification: Notification = {
        id: `N-${Date.now()}`,
        type: riskLevel === "High" ? "alert" : "success",
        title: "Patient Added",
        message: `${savedPatient.name} has been registered with ${riskLevel} risk level`,
        timestamp: new Date().toISOString(),
        read: false,
        patientId: savedPatient.id,
        action: { label: "View Profile", path: `/patient/${savedPatient.id}` },
      };
      await notificationService.createNotification(notification);

      set((s) => ({
        patients: [...s.patients, savedPatient],
        alerts: [...s.alerts, ...newAlerts],
        notifications: [notification, ...s.notifications],
      }));
    } catch (error) {
      console.error("Error adding patient:", error);
    }
  },

  // Update patient
  updatePatient: async (patientId, input) => {
    try {
      const existingPatient = get().patients.find((p) => p.id === patientId);
      if (!existingPatient) return;

      const heightM = input.heightCm / 100;
      const bmi = input.weightKg / (heightM * heightM);

      let preeclampsia = rand(5, 30);
      let hypertension = rand(5, 25);
      let stress = rand(10, 30);

      if (input.preeclampsiaHistory) {
        preeclampsia += 20;
      }
      if (input.preeclampsiaFamilyHistory) {
        preeclampsia += 15;
      }
      if (input.systolic > 140 || input.diastolic > 90) {
        hypertension += 20;
      }
      if (input.sleepHours < 6) {
        stress += 15;
      }

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

      // Save to Supabase
      await patientService.updatePatient(patientId, updatedPatient);

      let updatedAlerts = get().alerts;
      let notificationsToAdd: Notification[] = [];
      const existingAlert = get().alerts.find((a) => a.patientId === patientId && !a.resolved);
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
          updatedAlerts = [...updatedAlerts, await alertService.createAlert(newAlert)];
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
      } else if (existingAlert) {
        await alertService.updateAlert(existingAlert.id, { resolved: true });
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

      // Save notifications
      for (const notif of notificationsToAdd) {
        await notificationService.createNotification(notif);
      }

      set({
        patients: get().patients.map((p) => (p.id === patientId ? updatedPatient : p)),
        alerts: updatedAlerts,
        notifications: [...notificationsToAdd, ...get().notifications],
      });
    } catch (error) {
      console.error("Error updating patient:", error);
    }
  },

  // Delete patient
  deletePatient: async (id) => {
    try {
      await patientService.deletePatient(id);
      set((s) => ({
        patients: s.patients.filter((p) => p.id !== id),
        alerts: s.alerts.filter((a) => a.patientId !== id),
      }));
    } catch (error) {
      console.error("Error deleting patient:", error);
    }
  },
}));
