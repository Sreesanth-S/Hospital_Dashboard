import { create } from "zustand";
import type { User } from "@/types";

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
  logout: () => void;
  initializeAuth: () => void;
}

// Demo user for testing
const DEMO_USERS = [
  {
    id: "U-1001",
    email: "doctor@hospital.com",
    password: "doctor123",
    name: "Dr. Rebecca Cole",
    role: "doctor" as const,
    specialization: "OB-GYN",
    hospitalName: "Central Medical Hospital",
  },
  {
    id: "U-1002",
    email: "admin@hospital.com",
    password: "admin123",
    name: "Admin Sarah",
    role: "admin" as const,
    hospitalName: "Central Medical Hospital",
  },
  {
    id: "U-1003",
    email: "nurse@hospital.com",
    password: "nurse123",
    name: "Nurse Jennifer",
    role: "nurse" as const,
    specialization: "Midwifery",
    hospitalName: "Central Medical Hospital",
  },
];

// Simple hash for demo purposes (NOT FOR PRODUCTION)
function simpleHash(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return `h_${Math.abs(hash).toString(36)}`;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,

  initializeAuth: () => {
    // Initialize registered users with demo users (hashed passwords)
    const savedUsers = localStorage.getItem("registeredUsers");
    if (!savedUsers) {
      const hashedDemoUsers = DEMO_USERS.map((u) => ({
        ...u,
        password: simpleHash(u.password),
      }));
      localStorage.setItem("registeredUsers", JSON.stringify(hashedDemoUsers));
    }

    // Load user from localStorage on app startup
    const savedUser = localStorage.getItem("currentUser");
    if (savedUser) {
      try {
        const user = JSON.parse(savedUser);
        // Validate user session is still valid
        if (user && user.id && user.email) {
          set({ user, isAuthenticated: true });
        } else {
          localStorage.removeItem("currentUser");
        }
      } catch (error) {
        console.error("Failed to load user from localStorage", error);
        localStorage.removeItem("currentUser");
      }
    }
    set({ isLoading: false });
  },

  login: async (email: string, password: string) => {
    set({ isLoading: true });
    try {
      // Validate inputs
      if (!email || !password) {
        throw new Error("Email and password are required");
      }

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Check against registered users in localStorage
      const registeredUsers = JSON.parse(localStorage.getItem("registeredUsers") || "[]");
      const hashedPassword = simpleHash(password);
      
      const user = registeredUsers.find(
        (u: any) => u.email === email && u.password === hashedPassword
      );

      if (!user) {
        throw new Error("Invalid email or password");
      }

      // Remove password from stored user
      const { password: _, ...userWithoutPassword } = user;
      localStorage.setItem("currentUser", JSON.stringify(userWithoutPassword));
      set({ user: userWithoutPassword, isAuthenticated: true });
    } catch (error) {
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  signup: async (data) => {
    set({ isLoading: true });
    try {
      // Validate inputs
      if (!data.email || !data.password || !data.name) {
        throw new Error("Email, password, and name are required");
      }

      if (data.password.length < 6) {
        throw new Error("Password must be at least 6 characters");
      }

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Check if email already exists
      const registeredUsers = JSON.parse(localStorage.getItem("registeredUsers") || "[]");
      if (registeredUsers.some((u: any) => u.email === data.email)) {
        throw new Error("Email already registered");
      }

      // Create new user with hashed password
      const newUser = {
        id: `U-${Date.now()}`,
        email: data.email,
        password: simpleHash(data.password),
        name: data.name,
        role: data.role,
        specialization: data.specialization,
        hospitalName: data.hospitalName,
      };

      registeredUsers.push(newUser);
      localStorage.setItem("registeredUsers", JSON.stringify(registeredUsers));

      // Auto login after signup
      const { password: _, ...userWithoutPassword } = newUser;
      localStorage.setItem("currentUser", JSON.stringify(userWithoutPassword));
      set({ user: userWithoutPassword, isAuthenticated: true });
    } catch (error) {
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  logout: () => {
    localStorage.removeItem("currentUser");
    set({ user: null, isAuthenticated: false });
  },
}));
