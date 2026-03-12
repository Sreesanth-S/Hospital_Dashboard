import { useEffect } from "react";
import { useStore } from "@/store/supabaseStore";

/**
 * Hook to initialize Supabase data on component mount
 * Fetches patients, alerts, and notifications from Supabase
 */
export const useSupabaseInit = () => {
  const initializeData = useStore((state) => state.initializeData);
  const isLoading = useStore((state) => state.isLoading);
  const error = useStore((state) => state.error);

  useEffect(() => {
    initializeData();
  }, [initializeData]);

  return { isLoading, error };
};

/**
 * Hook to set up real-time subscriptions for data changes
 * (Requires Supabase to be properly configured)
 */
export const useSupabaseSubscriptions = () => {
  const patients = useStore((state) => state.patients);
  const alerts = useStore((state) => state.alerts);
  const notifications = useStore((state) => state.notifications);

  useEffect(() => {
    // You can add subscription setup here when Supabase realtime is properly configured
    // For now, data is fetched on mount via useSupabaseInit
  }, []);

  return { patients, alerts, notifications };
};
