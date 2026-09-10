import { supabase } from "@/lib/supabase";
import bcrypt from "bcryptjs";

export interface UserItem {
  id: string;
  username: string;
  email: string;
  role: string;
  password?: string;
  created_at?: string;
  edited_at?: string;
  createdAt?: string;
}

/**
 * Hash password securely using industry-standard bcrypt.
 * Ensures passwords are never stored in plain-text.
 */
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hashSync(password, 10);
}

/**
 * Verify if raw password matches the stored cryptographic hash.
 * Supports Bcrypt ($2a$, $2b$, $2y$), PBKDF2 SHA-256, and plain text fallback.
 */
export async function verifyPassword(
  password: string,
  storedHash: string
): Promise<boolean> {
  if (!storedHash) return false;

  // 1. Check Bcrypt ($2a$, $2b$, $2y$)
  if (
    storedHash.startsWith("$2a$") ||
    storedHash.startsWith("$2b$") ||
    storedHash.startsWith("$2y$")
  ) {
    try {
      return bcrypt.compareSync(password, storedHash);
    } catch (err) {
      console.error("Bcrypt verification error:", err);
      return false;
    }
  }

  // 2. Check PBKDF2 64-hex character fallback
  if (storedHash.length === 64) {
    try {
      const encoder = new TextEncoder();
      const salt = encoder.encode("dps_cms_secure_salt_2026");
      const keyMaterial = await crypto.subtle.importKey(
        "raw",
        encoder.encode(password),
        { name: "PBKDF2" },
        false,
        ["deriveBits"]
      );
      const derivedKey = await crypto.subtle.deriveBits(
        {
          name: "PBKDF2",
          salt,
          iterations: 100000,
          hash: "SHA-256",
        },
        keyMaterial,
        256
      );
      const pbkdf2Hash = Array.from(new Uint8Array(derivedKey))
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("");
      if (pbkdf2Hash === storedHash) return true;
    } catch (err) {
      console.error("PBKDF2 verification error:", err);
    }
  }

  // 3. Plain text direct match fallback
  return password === storedHash;
}

/**
 * Fetch all users directly from Supabase `public.users` table.
 * NO dummy data.
 */
export async function getUsers(): Promise<UserItem[]> {
  const { data, error } = await supabase
    .from("users")
    .select("id, username, email, role, created_at, edited_at")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching users from Supabase:", error.message || error);
    throw error;
  }

  return (data || []).map((u: any) => ({
    id: u.id,
    username: u.username,
    email: u.email,
    role: u.role,
    created_at: u.created_at,
    edited_at: u.edited_at,
    createdAt: u.created_at
      ? new Date(u.created_at).toLocaleDateString("id-ID", {
          day: "numeric",
          month: "short",
          year: "numeric",
        })
      : "Baru saja",
  }));
}

/**
 * Create a new user in Supabase `public.users` table
 */
export async function createUser(payload: {
  username: string;
  email: string;
  role: string;
  password: string;
}): Promise<UserItem> {
  const hashedPassword = await hashPassword(payload.password);

  const insertPayload = {
    username: payload.username.trim(),
    email: payload.email.trim().toLowerCase(),
    role: payload.role,
    password: hashedPassword,
  };

  const { data, error } = await supabase
    .from("users")
    .insert([insertPayload])
    .select("id, username, email, role, created_at, edited_at")
    .single();

  if (error) {
    console.error("Error creating user in Supabase:", error.message || error);
    throw error;
  }

  return {
    id: data.id,
    username: data.username,
    email: data.email,
    role: data.role,
    created_at: data.created_at,
    edited_at: data.edited_at,
    createdAt: data.created_at
      ? new Date(data.created_at).toLocaleDateString("id-ID", {
          day: "numeric",
          month: "short",
          year: "numeric",
        })
      : "Baru saja",
  };
}

/**
 * Update an existing user in Supabase `public.users` table
 */
export async function updateUser(
  id: string,
  payload: {
    username: string;
    email: string;
    role: string;
    password?: string;
  }
): Promise<UserItem> {
  const updatePayload: Record<string, any> = {
    username: payload.username.trim(),
    email: payload.email.trim().toLowerCase(),
    role: payload.role,
    edited_at: new Date().toISOString(),
  };

  if (payload.password && payload.password.trim()) {
    updatePayload.password = await hashPassword(payload.password);
  }

  const { data, error } = await supabase
    .from("users")
    .update(updatePayload)
    .eq("id", id)
    .select("id, username, email, role, created_at, edited_at")
    .single();

  if (error) {
    console.error(`Error updating user ${id} in Supabase:`, error.message || error);
    throw error;
  }

  return {
    id: data.id,
    username: data.username,
    email: data.email,
    role: data.role,
    created_at: data.created_at,
    edited_at: data.edited_at,
    createdAt: data.created_at
      ? new Date(data.created_at).toLocaleDateString("id-ID", {
          day: "numeric",
          month: "short",
          year: "numeric",
        })
      : "Baru saja",
  };
}

/**
 * Delete a user from Supabase `public.users` table
 */
export async function deleteUser(id: string): Promise<void> {
  const { error } = await supabase.from("users").delete().eq("id", id);
  if (error) {
    console.error(`Error deleting user ${id} in Supabase:`, error.message || error);
    throw error;
  }
}
