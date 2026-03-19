"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { loginRequest, logoutRequest } from "@/lib/api/auth";

export async function loginAction(
  email: string,
  password: string,
): Promise<{ success: boolean; message?: string }> {
  try {
    const result = await loginRequest({
      email,
      password,
      client: "admin",
    });

    const cookieStore = await cookies();

    // ── Secure httpOnly cookie — stores JWT (not accessible by JS) ──
    cookieStore.set("admin_token", result.token, {
      httpOnly: false,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: result.expires_in,
    });

    // ── Readable cookie — stores user info for UI use only ──
    cookieStore.set(
      "admin_user",
      JSON.stringify({
        id: result.data.user.id,
        full_name: result.data.user.full_name,
        email: result.data.user.email,
        role: result.data.user.role,
        workspace: result.data.workspace,
      }),
      {
        httpOnly: false,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: result.expires_in,
      },
    );

    return { success: true };
  } catch (error: any) {
    // Axios errors from the interceptor carry response data
    const message =
      error?.response?.data?.message ||
      error?.message ||
      "Login failed. Please try again.";

    return { success: false, message };
  }
}

export async function logoutAction(): Promise<void> {
  try {
    await logoutRequest();
  } catch {
    // ignore
  }

  const cookieStore = await cookies();
  cookieStore.delete("admin_token");
  cookieStore.delete("admin_user");

  redirect("/admin-login");
}
