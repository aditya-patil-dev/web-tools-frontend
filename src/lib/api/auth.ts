import { jwtDecode } from "jwt-decode";

export type DecodedUser = {
  id: string;
  email: string;
  role: string;
  exp: number;
};

export function getLoggedInUser(): DecodedUser | null {
  try {
    if (typeof window === "undefined") return null;

    const token = localStorage.getItem("jwtToken");
    if (!token) return null;

    return jwtDecode<DecodedUser>(token);
  } catch (error) {
    console.error("JWT decode failed", error);
    return null;
  }
}

export function isTokenExpired(token: string): boolean {
  try {
    const decoded = jwtDecode<{ exp: number }>(token);
    return decoded.exp * 1000 < Date.now();
  } catch {
    return true;
  }
}
