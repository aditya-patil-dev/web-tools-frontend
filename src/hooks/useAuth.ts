"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { logoutAction } from "@/lib/api/auth.actions";

export interface AuthUser {
  id: string;
  full_name: string;
  email: string;
  role: string;
  workspace: {
    id: string;
    name: string;
    type: string;
    status: string;
    member_role: string;
  };
}

function parseUserCookie(): AuthUser | null {
  try {
    const match = document.cookie
      .split("; ")
      .find((row) => row.startsWith("admin_user="));

    if (!match) return null;

    const raw = decodeURIComponent(match.split("=")[1]);
    return JSON.parse(raw) as AuthUser;
  } catch {
    return null;
  }
}

export function useAuth() {
  const router = useRouter();
  const [user, setUser] = useState<AuthUser | null>(() => {
    if (typeof document === "undefined") return null;
    return parseUserCookie();
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
  }, []);

  const logout = useCallback(async () => {
    await logoutAction();
    setUser(null);
    router.push("/admin-login");
  }, [router]);

  return { user, loading, logout, isAuthenticated: !!user };
}
