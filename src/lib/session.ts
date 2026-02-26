// src/lib/session.ts
// Generates a stable anonymous session ID per browser using localStorage.
// SSR-safe — returns empty string on server.

export const SESSION_KEY = "wt_session_id";

export function getOrCreateSessionId(): string {
    if (typeof window === "undefined") return "";
    let id = localStorage.getItem(SESSION_KEY);
    if (!id) {
        id = crypto.randomUUID();
        localStorage.setItem(SESSION_KEY, id);
    }
    return id;
}