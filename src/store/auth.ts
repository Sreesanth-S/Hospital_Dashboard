import { create } from "zustand";
import type { User } from "@/types";
import { supabase } from "@/lib/supabase";
import { userService } from "@/lib/services/userService";

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (data: {
    email: string;
    password: string;
    name: string;
    role: "admin" | "doctor" | "nurse";
    specialization?: string;
    hospitalName?: string;
  }) => Promise<void>;
  forgotPassword: (email: string) => Promise<void>;
  logout: () => Promise<void>;
  initializeAuth: () => void;
}

function mapAuthUserToUser(authUser: any): User {
  const meta = authUser?.user_metadata ?? {};
  const metadataRole = meta.role;
  const role = metadataRole === "admin" || metadataRole === "doctor" || metadataRole === "nurse"
    ? metadataRole
    : "doctor";
  return {
    id: authUser.id,
    email: authUser.email ?? "",
    name: meta.name || authUser.email || "User",
    role,
    specialization: meta.specialization || undefined,
    hospitalName: meta.hospitalName || undefined,
  };
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,

  initializeAuth: () => {
    supabase.auth
      .getSession()
      .then(async ({ data, error }) => {
        if (error) {
          throw error;
        }

        const authUser = data.session?.user;
        if (authUser) {
          const mappedUser = mapAuthUserToUser(authUser);
          await userService.upsertUser(mappedUser);
          set({
            user: mappedUser,
            isAuthenticated: true,
            isLoading: false,
          });
          return;
        }

        set({ user: null, isAuthenticated: false, isLoading: false });
      })
      .catch((error) => {
        console.error("Failed to initialize auth session", error);
        set({ user: null, isAuthenticated: false, isLoading: false });
      });
  },

  login: async (email: string, password: string) => {
    set({ isLoading: true });
    try {
      if (!email || !password) {
        throw new Error("Email and password are required");
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        throw error;
      }

      const authUser = data.user;
      if (!authUser) {
        throw new Error("Login failed. Please try again.");
      }

      const mappedUser = mapAuthUserToUser(authUser);
      await userService.upsertUser(mappedUser);
      set({ user: mappedUser, isAuthenticated: true });
    } catch (error) {
      if (error instanceof Error) throw error;
      throw new Error("Unable to sign in");
    } finally {
      set({ isLoading: false });
    }
  },

  signup: async (data) => {
    set({ isLoading: true });
    try {
      if (!data.email || !data.password || !data.name) {
        throw new Error("Email, password, and name are required");
      }

      if (data.password.length < 6) {
        throw new Error("Password must be at least 6 characters");
      }

      const { data: signUpData, error } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            name: data.name,
            role: data.role,
            specialization: data.specialization || null,
            hospitalName: data.hospitalName || null,
          },
        },
      });

      if (error) {
        throw error;
      }

      const authUser = signUpData.user;
      const hasSession = !!signUpData.session;
      if (authUser) {
        await userService.upsertUser(mapAuthUserToUser(authUser));
      }
      set({
        user: authUser && hasSession ? mapAuthUserToUser(authUser) : null,
        isAuthenticated: hasSession,
      });
    } catch (error) {
      if (error instanceof Error) throw error;
      throw new Error("Unable to create account");
    } finally {
      set({ isLoading: false });
    }
  },

  forgotPassword: async (email: string) => {
    if (!email) {
      throw new Error("Email is required");
    }

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    if (error) {
      throw error;
    }
  },

  logout: async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      throw error;
    }
    set({ user: null, isAuthenticated: false });
  },
}));
