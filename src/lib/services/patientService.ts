import { supabase } from "../supabase";
import type { Patient } from "@/types";

type PatientRow = {
  id: string;
  name: string;
  age: number;
  blood_group: string;
  pregnancy_week: number;
  blood_pressure: string;
  heart_rate: number;
  risk_level: Patient["riskLevel"];
  last_updated: string;
  weight_kg: number;
  height_cm: number;
  bmi: number;
  gravida: number;
  symptoms: string[] | null;
  headache: boolean;
  swelling_face: boolean;
  swelling_hand: boolean;
  swelling_feet: boolean;
  sleep_hours: number;
  preeclampsia_history: boolean;
  preeclampsia_family_history: boolean;
  preeclampsia_family_relationship: string | null;
  preeclampsia_risk: number;
  hypertension_risk: number;
  stress_risk: number;
  bp_history: Patient["bpHistory"] | null;
  weight_history: Patient["weightHistory"] | null;
  risk_history: Patient["riskHistory"] | null;
  doctor_notes: string | null;
  follow_up: string | null;
};

function mapRowToPatient(row: PatientRow): Patient {
  return {
    id: row.id,
    name: row.name,
    age: row.age,
    bloodGroup: row.blood_group,
    pregnancyWeek: row.pregnancy_week,
    bloodPressure: row.blood_pressure,
    heartRate: row.heart_rate,
    riskLevel: row.risk_level,
    lastUpdated: row.last_updated,
    weightKg: row.weight_kg,
    heightCm: row.height_cm,
    bmi: row.bmi,
    gravida: row.gravida,
    symptoms: row.symptoms ?? [],
    headache: row.headache,
    swelling: {
      face: row.swelling_face,
      hand: row.swelling_hand,
      feet: row.swelling_feet,
    },
    sleepHours: row.sleep_hours,
    preeclampsiaHistory: row.preeclampsia_history,
    preeclampsiaFamilyHistory: row.preeclampsia_family_history,
    preeclampsiaFamilyRelationship: row.preeclampsia_family_relationship ?? undefined,
    preeclampsiaRisk: row.preeclampsia_risk,
    hypertensionRisk: row.hypertension_risk,
    stressRisk: row.stress_risk,
    bpHistory: row.bp_history ?? [],
    weightHistory: row.weight_history ?? [],
    riskHistory: row.risk_history ?? [],
    doctorNotes: row.doctor_notes ?? "",
    followUp: row.follow_up ?? "",
  };
}

function mapPatientToRow(patient: Partial<Patient>) {
  const row: Record<string, unknown> = {};

  if (patient.id !== undefined) row.id = patient.id;
  if (patient.name !== undefined) row.name = patient.name;
  if (patient.age !== undefined) row.age = patient.age;
  if (patient.bloodGroup !== undefined) row.blood_group = patient.bloodGroup;
  if (patient.pregnancyWeek !== undefined) row.pregnancy_week = patient.pregnancyWeek;
  if (patient.bloodPressure !== undefined) row.blood_pressure = patient.bloodPressure;
  if (patient.heartRate !== undefined) row.heart_rate = patient.heartRate;
  if (patient.riskLevel !== undefined) row.risk_level = patient.riskLevel;
  if (patient.weightKg !== undefined) row.weight_kg = patient.weightKg;
  if (patient.heightCm !== undefined) row.height_cm = patient.heightCm;
  if (patient.bmi !== undefined) row.bmi = patient.bmi;
  if (patient.gravida !== undefined) row.gravida = patient.gravida;
  if (patient.symptoms !== undefined) row.symptoms = patient.symptoms;
  if (patient.headache !== undefined) row.headache = patient.headache;
  if (patient.swelling !== undefined) {
    row.swelling_face = patient.swelling.face;
    row.swelling_hand = patient.swelling.hand;
    row.swelling_feet = patient.swelling.feet;
  }
  if (patient.sleepHours !== undefined) row.sleep_hours = patient.sleepHours;
  if (patient.preeclampsiaHistory !== undefined) row.preeclampsia_history = patient.preeclampsiaHistory;
  if (patient.preeclampsiaFamilyHistory !== undefined) row.preeclampsia_family_history = patient.preeclampsiaFamilyHistory;
  if (patient.preeclampsiaFamilyRelationship !== undefined) row.preeclampsia_family_relationship = patient.preeclampsiaFamilyRelationship;
  if (patient.preeclampsiaRisk !== undefined) row.preeclampsia_risk = patient.preeclampsiaRisk;
  if (patient.hypertensionRisk !== undefined) row.hypertension_risk = patient.hypertensionRisk;
  if (patient.stressRisk !== undefined) row.stress_risk = patient.stressRisk;
  if (patient.bpHistory !== undefined) row.bp_history = patient.bpHistory;
  if (patient.weightHistory !== undefined) row.weight_history = patient.weightHistory;
  if (patient.riskHistory !== undefined) row.risk_history = patient.riskHistory;
  if (patient.doctorNotes !== undefined) row.doctor_notes = patient.doctorNotes;
  if (patient.followUp !== undefined) row.follow_up = patient.followUp;
  if (patient.lastUpdated !== undefined) row.last_updated = patient.lastUpdated;

  return row;
}

export const patientService = {
  // Fetch all patients
  async fetchAllPatients(): Promise<Patient[]> {
    const { data, error } = await supabase
      .from("patients")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;
    return ((data as PatientRow[]) || []).map(mapRowToPatient);
  },

  // Fetch single patient by ID
  async fetchPatientById(id: string): Promise<Patient | null> {
    const { data, error } = await supabase
      .from("patients")
      .select("*")
      .eq("id", id)
      .single();

    if (error && error.code !== "PGRST116") throw error;
    return data ? mapRowToPatient(data as PatientRow) : null;
  },

  // Create new patient
  async createPatient(patient: Omit<Patient, "lastUpdated">): Promise<Patient> {
    const { data, error } = await supabase
      .from("patients")
      .insert([{ ...mapPatientToRow(patient), last_updated: new Date().toISOString() }])
      .select()
      .single();

    if (error) throw error;
    return mapRowToPatient(data as PatientRow);
  },

  // Update patient
  async updatePatient(id: string, updates: Partial<Patient>): Promise<Patient> {
    const { data, error } = await supabase
      .from("patients")
      .update({ ...mapPatientToRow(updates), last_updated: new Date().toISOString() })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return mapRowToPatient(data as PatientRow);
  },

  // Delete patient
  async deletePatient(id: string): Promise<void> {
    const { error } = await supabase
      .from("patients")
      .delete()
      .eq("id", id);

    if (error) throw error;
  },

  // Real-time subscription to patients
  subscribeToPatients(callback: (patients: Patient[]) => void) {
    const subscription = supabase
      .channel("patients_changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "patients" },
        () => {
          // Refetch all patients when any change occurs
          this.fetchAllPatients().then(callback);
        },
      )
      .subscribe();

    return subscription;
  },

  // Real-time subscription to specific patient
  subscribeToPatient(patientId: string, callback: (patient: Patient | null) => void) {
    const subscription = supabase
      .channel(`patient_${patientId}_updates`)
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "patients" },
        (payload) => {
          const updatedPatient = mapRowToPatient(payload.new as PatientRow);
          if (updatedPatient.id === patientId) {
            callback(updatedPatient);
          }
        },
      )
      .subscribe();

    return subscription;
  },
};
