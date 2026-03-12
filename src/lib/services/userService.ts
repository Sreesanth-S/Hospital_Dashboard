import { supabase } from "../supabase";
import type { User } from "@/types";

type UserRow = {
  id: string;
  email: string;
  name: string;
  role: User["role"];
  specialization: string | null;
  hospital_name: string | null;
};

function mapRowToUser(row: UserRow): User {
  return {
    id: row.id,
    email: row.email,
    name: row.name,
    role: row.role,
    specialization: row.specialization ?? undefined,
    hospitalName: row.hospital_name ?? undefined,
  };
}

function mapUserToRow(user: Partial<User>) {
  const row: Record<string, unknown> = {};
  if (user.id !== undefined) row.id = user.id;
  if (user.email !== undefined) row.email = user.email;
  if (user.name !== undefined) row.name = user.name;
  if (user.role !== undefined) row.role = user.role;
  if (user.specialization !== undefined) row.specialization = user.specialization;
  if (user.hospitalName !== undefined) row.hospital_name = user.hospitalName;
  return row;
}

export const userService = {
  // Fetch all users
  async fetchAllUsers(): Promise<User[]> {
    const { data, error } = await supabase
      .from("users")
      .select("*")
      .order("name", { ascending: true });

    if (error) throw error;
    return ((data as UserRow[]) || []).map(mapRowToUser);
  },

  // Fetch user by ID
  async fetchUserById(id: string): Promise<User | null> {
    const { data, error } = await supabase
      .from("users")
      .select("*")
      .eq("id", id)
      .single();

    if (error && error.code !== "PGRST116") throw error;
    return data ? mapRowToUser(data as UserRow) : null;
  },

  // Fetch user by email
  async fetchUserByEmail(email: string): Promise<User | null> {
    const { data, error } = await supabase
      .from("users")
      .select("*")
      .eq("email", email)
      .single();

    if (error && error.code !== "PGRST116") throw error;
    return data ? mapRowToUser(data as UserRow) : null;
  },

  // Create new user
  async createUser(user: Omit<User, "id">): Promise<User> {
    const { data, error } = await supabase
      .from("users")
      .insert([mapUserToRow(user)])
      .select()
      .single();

    if (error) throw error;
    return mapRowToUser(data as UserRow);
  },

  // Upsert user profile
  async upsertUser(user: User): Promise<User> {
    const { data, error } = await supabase
      .from("users")
      .upsert([mapUserToRow(user)], { onConflict: "id" })
      .select()
      .single();

    if (error) throw error;
    return mapRowToUser(data as UserRow);
  },

  // Update user
  async updateUser(id: string, updates: Partial<User>): Promise<User> {
    const { data, error } = await supabase
      .from("users")
      .update(mapUserToRow(updates))
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return mapRowToUser(data as UserRow);
  },

  // Delete user
  async deleteUser(id: string): Promise<void> {
    const { error } = await supabase
      .from("users")
      .delete()
      .eq("id", id);

    if (error) throw error;
  },

  // Real-time subscription to users
  subscribeToUsers(callback: (users: User[]) => void) {
    const subscription = supabase
      .channel("users_changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "users" },
        () => {
          this.fetchAllUsers().then(callback);
        },
      )
      .subscribe();

    return subscription;
  },
};
