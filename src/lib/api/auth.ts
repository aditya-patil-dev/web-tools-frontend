import { api } from "./api";

// ─── Types ───────────────────────────────────────────────────────────────────

export interface LoginPayload {
  email: string;
  password: string;
  client?: "admin" | "customer";
}

export interface LoginUser {
  id: string;
  full_name: string;
  email: string;
  phone_number: string | null;
  role: string;
  account_status: string;
  last_login_at: string;
}

export interface LoginWorkspace {
  id: string;
  name: string;
  type: string;
  status: string;
  member_role: string;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  data: {
    user: LoginUser;
    workspace: LoginWorkspace;
  };
  token: string;
  expires_in: number;
}

// ─── API Calls ────────────────────────────────────────────────────────────────

export async function loginRequest(
  payload: LoginPayload,
): Promise<LoginResponse> {
  return api.post<LoginResponse>("/users/login", payload);
}

export async function logoutRequest(): Promise<void> {
  // Call your backend logout if you have one
  // If not, the server action handles cookie clearing
  try {
    await api.post("/users/logout");
  } catch {
    // Silently fail — we'll clear cookies regardless
  }
}
