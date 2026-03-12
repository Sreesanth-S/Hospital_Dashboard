import { supabase } from "../supabase";
import type { Notification } from "@/types";

type NotificationRow = {
  id: string;
  type: Notification["type"];
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  patient_id: string | null;
  action_label: string | null;
  action_path: string | null;
};

function mapRowToNotification(row: NotificationRow): Notification {
  return {
    id: row.id,
    type: row.type,
    title: row.title,
    message: row.message,
    timestamp: row.timestamp,
    read: row.read,
    patientId: row.patient_id ?? undefined,
    action: row.action_label || row.action_path
      ? { label: row.action_label ?? "", path: row.action_path ?? undefined }
      : undefined,
  };
}

function mapNotificationToRow(notification: Partial<Notification>) {
  const row: Record<string, unknown> = {};
  if (notification.id !== undefined) row.id = notification.id;
  if (notification.type !== undefined) row.type = notification.type;
  if (notification.title !== undefined) row.title = notification.title;
  if (notification.message !== undefined) row.message = notification.message;
  if (notification.timestamp !== undefined) row.timestamp = notification.timestamp;
  if (notification.read !== undefined) row.read = notification.read;
  if (notification.patientId !== undefined) row.patient_id = notification.patientId;
  if (notification.action !== undefined) {
    row.action_label = notification.action?.label;
    row.action_path = notification.action?.path;
  }
  return row;
}

export const notificationService = {
  // Fetch all notifications
  async fetchAllNotifications(): Promise<Notification[]> {
    const { data, error } = await supabase
      .from("notifications")
      .select("*")
      .order("timestamp", { ascending: false });

    if (error) throw error;
    return ((data as NotificationRow[]) || []).map(mapRowToNotification);
  },

  // Fetch unread notifications
  async fetchUnreadNotifications(): Promise<Notification[]> {
    const { data, error } = await supabase
      .from("notifications")
      .select("*")
      .eq("read", false)
      .order("timestamp", { ascending: false });

    if (error) throw error;
    return ((data as NotificationRow[]) || []).map(mapRowToNotification);
  },

  // Create new notification
  async createNotification(notification: Omit<Notification, "id">): Promise<Notification> {
    const { data, error } = await supabase
      .from("notifications")
      .insert([mapNotificationToRow(notification)])
      .select()
      .single();

    if (error) throw error;
    return mapRowToNotification(data as NotificationRow);
  },

  // Mark notification as read
  async markAsRead(id: string): Promise<Notification> {
    const { data, error } = await supabase
      .from("notifications")
      .update({ read: true })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return mapRowToNotification(data as NotificationRow);
  },

  // Mark all as read
  async markAllAsRead(): Promise<void> {
    const { error } = await supabase
      .from("notifications")
      .update({ read: true })
      .eq("read", false);

    if (error) throw error;
  },

  // Delete notification
  async deleteNotification(id: string): Promise<void> {
    const { error } = await supabase
      .from("notifications")
      .delete()
      .eq("id", id);

    if (error) throw error;
  },

  // Real-time subscription to notifications
  subscribeToNotifications(callback: (notifications: Notification[]) => void) {
    const subscription = supabase
      .channel("notifications_changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "notifications" },
        () => {
          this.fetchAllNotifications().then(callback);
        },
      )
      .subscribe();

    return subscription;
  },
};
