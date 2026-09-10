import { supabase } from "@/lib/supabase";
import { hashPassword, verifyPassword } from "./userApi";

export interface AuthUser {
  id: string;
  username: string;
  email: string;
  role: string;
}

export interface AuthSession {
  user: AuthUser;
  loginTime: number;
  expiresAt: number;
}

const SESSION_KEY = "dps_cms_auth_session";
// 30 minutes in milliseconds
export const SESSION_DURATION_MS = 30 * 60 * 1000;

/**
 * Check authentication session status.
 * Distinguishes between expired session vs not logged in at all.
 */
export function checkAuthSession(): {
  status: "valid" | "expired" | "none";
  session: AuthSession | null;
} {
  if (typeof window === "undefined") return { status: "none", session: null };

  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return { status: "none", session: null };

    const session: AuthSession = JSON.parse(raw);
    const now = Date.now();

    // Check if session has expired (30 minutes security)
    if (!session.expiresAt || now > session.expiresAt) {
      clearAuthSession();
      return { status: "expired", session: null };
    }

    return { status: "valid", session };
  } catch (err) {
    console.error("Error checking auth session:", err);
    clearAuthSession();
    return { status: "none", session: null };
  }
}

/**
 * Read the current active session.
 * Automatically checks for 30-minute expiration.
 */
export function getAuthSession(): AuthSession | null {
  const result = checkAuthSession();
  return result.status === "valid" ? result.session : null;
}

/**
 * Save auth session to localStorage and cookie
 */
export function saveAuthSession(user: AuthUser): AuthSession {
  const now = Date.now();
  const session: AuthSession = {
    user,
    loginTime: now,
    expiresAt: now + SESSION_DURATION_MS,
  };

  if (typeof window !== "undefined") {
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    document.cookie = `dps_cms_auth=1; path=/; max-age=1800; SameSite=Lax`;
  }

  return session;
}

/**
 * Clear session and logout
 */
export function clearAuthSession(): void {
  if (typeof window !== "undefined") {
    localStorage.removeItem(SESSION_KEY);
    document.cookie = `dps_cms_auth=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax`;
  }
}

/**
 * Login user by email & password
 */
export async function loginUser(
  emailInput: string,
  passwordInput: string
): Promise<AuthSession> {
  const cleanEmail = emailInput.trim().toLowerCase();
  const cleanPassword = passwordInput.trim();

  if (!cleanEmail || !cleanPassword) {
    throw new Error("Email dan Password wajib diisi.");
  }

  try {
    // 1. Fetch user from Supabase public.users
    const { data, error } = await supabase
      .from("users")
      .select("id, username, email, role, password")
      .eq("email", cleanEmail)
      .limit(1);

    if (error) {
      console.warn("Supabase login query warning:", error.message || error);
    }

    if (data && data.length > 0) {
      const dbUser = data[0];
      const storedPassword = dbUser.password || "";

      // Verify password with universal verification (Bcrypt, PBKDF2, plain)
      const isMatch = await verifyPassword(cleanPassword, storedPassword);

      if (!isMatch) {
        throw new Error("Password yang Anda masukkan salah.");
      }

      const authUser: AuthUser = {
        id: dbUser.id,
        username: dbUser.username,
        email: dbUser.email,
        role: dbUser.role || "Admin",
      };

      return saveAuthSession(authUser);
    }

    // 2. If table has no users yet or user is the initial master account
    const { count } = await supabase
      .from("users")
      .select("*", { count: "exact", head: true });

    if (
      count === 0 &&
      cleanEmail === "superadmin@duaputra.id" &&
      cleanPassword === "password123"
    ) {
      // Seed the initial Super Admin into Supabase
      const hashed = await hashPassword(cleanPassword);
      const { data: created, error: _createErr } = await supabase
        .from("users")
        .insert([
          {
            username: "Super Admin",
            email: cleanEmail,
            role: "Super Admin",
            password: hashed,
          },
        ])
        .select()
        .single();

      const authUser: AuthUser = {
        id: created?.id || "initial-super-admin",
        username: "Super Admin",
        email: cleanEmail,
        role: "Super Admin",
      };

      return saveAuthSession(authUser);
    }

    throw new Error("Akun dengan email tersebut tidak ditemukan.");
  } catch (err: any) {
    console.error("Login error:", err);
    throw err;
  }
}
