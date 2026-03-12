import { supabase } from "../supabase";
import type { Appointment } from "@/types";

type AppointmentRow = {
  id: string;
  patient_id: string;
  doctor_id: string;
  appointment_date: string;
  start_time: string;
  end_time: string;
  status: Appointment["status"];
  notes: string | null;
  created_at?: string;
  patient?: { name: string } | null;
  doctor?: { name: string } | null;
};

function mapRowToAppointment(row: AppointmentRow): Appointment {
  return {
    id: row.id,
    patientId: row.patient_id,
    doctorId: row.doctor_id,
    appointmentDate: row.appointment_date,
    startTime: row.start_time,
    endTime: row.end_time,
    status: row.status,
    notes: row.notes ?? "",
    createdAt: row.created_at,
    patientName: row.patient?.name,
    doctorName: row.doctor?.name,
  };
}

function mapAppointmentToRow(appointment: Partial<Appointment>) {
  const row: Record<string, unknown> = {};
  if (appointment.id !== undefined) row.id = appointment.id;
  if (appointment.patientId !== undefined) row.patient_id = appointment.patientId;
  if (appointment.doctorId !== undefined) row.doctor_id = appointment.doctorId;
  if (appointment.appointmentDate !== undefined) row.appointment_date = appointment.appointmentDate;
  if (appointment.startTime !== undefined) row.start_time = appointment.startTime;
  if (appointment.endTime !== undefined) row.end_time = appointment.endTime;
  if (appointment.status !== undefined) row.status = appointment.status;
  if (appointment.notes !== undefined) row.notes = appointment.notes;
  return row;
}

export const appointmentService = {
  async fetchAllAppointments(): Promise<Appointment[]> {
    const { data, error } = await supabase
      .from("appointments")
      .select("*")
      .order("appointment_date", { ascending: true })
      .order("start_time", { ascending: true });

    if (error) throw error;
    return ((data as AppointmentRow[]) || []).map(mapRowToAppointment);
  },

  async createAppointment(appointment: Appointment): Promise<Appointment> {
    const { data, error } = await supabase
      .from("appointments")
      .insert([mapAppointmentToRow(appointment)])
      .select("*")
      .single();

    if (error) throw error;
    return mapRowToAppointment(data as AppointmentRow);
  },

  async updateAppointment(id: string, updates: Partial<Appointment>): Promise<Appointment> {
    const { data, error } = await supabase
      .from("appointments")
      .update(mapAppointmentToRow(updates))
      .eq("id", id)
      .select("*")
      .single();

    if (error) throw error;
    return mapRowToAppointment(data as AppointmentRow);
  },
};
