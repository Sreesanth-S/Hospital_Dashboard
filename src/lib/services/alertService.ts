import { supabase } from "../supabase";
import type { Alert } from "@/types";

type AlertRow = {
  id: string;
  patient_id: string;
  patient_name: string;
  pregnancy_week: number;
  issue: string;
  timestamp: string;
  resolved: boolean;
};

function mapRowToAlert(row: AlertRow): Alert {
  return {
    id: row.id,
    patientId: row.patient_id,
    patientName: row.patient_name,
    pregnancyWeek: row.pregnancy_week,
    issue: row.issue,
    timestamp: row.timestamp,
    resolved: row.resolved,
  };
}

function mapAlertToRow(alert: Partial<Alert>) {
  const row: Record<string, unknown> = {};
  if (alert.id !== undefined) row.id = alert.id;
  if (alert.patientId !== undefined) row.patient_id = alert.patientId;
  if (alert.patientName !== undefined) row.patient_name = alert.patientName;
  if (alert.pregnancyWeek !== undefined) row.pregnancy_week = alert.pregnancyWeek;
  if (alert.issue !== undefined) row.issue = alert.issue;
  if (alert.timestamp !== undefined) row.timestamp = alert.timestamp;
  if (alert.resolved !== undefined) row.resolved = alert.resolved;
  return row;
}

export const alertService = {
  // Fetch all alerts
  async fetchAllAlerts(): Promise<Alert[]> {
    const { data, error } = await supabase
      .from("alerts")
      .select("*")
      .order("timestamp", { ascending: false });

    if (error) throw error;
    return ((data as AlertRow[]) || []).map(mapRowToAlert);
  },

  // Fetch alerts for specific patient
  async fetchPatientAlerts(patientId: string): Promise<Alert[]> {
    const { data, error } = await supabase
      .from("alerts")
      .select("*")
      .eq("patient_id", patientId)
      .order("timestamp", { ascending: false });

    if (error) throw error;
    return ((data as AlertRow[]) || []).map(mapRowToAlert);
  },

  // Create new alert
  async createAlert(alert: Omit<Alert, "id">): Promise<Alert> {
    const { data, error } = await supabase
      .from("alerts")
      .insert([mapAlertToRow(alert)])
      .select()
      .single();

    if (error) throw error;
    return mapRowToAlert(data as AlertRow);
  },

  // Update alert
  async updateAlert(id: string, updates: Partial<Alert>): Promise<Alert> {
    const { data, error } = await supabase
      .from("alerts")
      .update(mapAlertToRow(updates))
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return mapRowToAlert(data as AlertRow);
  },

  // Delete alert
  async deleteAlert(id: string): Promise<void> {
    const { error } = await supabase
      .from("alerts")
      .delete()
      .eq("id", id);

    if (error) throw error;
  },

  // Real-time subscription to alerts
  subscribeToAlerts(callback: (alerts: Alert[]) => void) {
    const subscription = supabase
      .channel("alerts_changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "alerts" },
        () => {
          this.fetchAllAlerts().then(callback);
        },
      )
      .subscribe();

    return subscription;
  },
};
