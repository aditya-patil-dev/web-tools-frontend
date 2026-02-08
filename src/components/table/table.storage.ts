import type { PersistedTablePrefs } from "./table.types";

const KEY_PREFIX = "dt_prefs:";

export function loadPrefs(tableId: string): PersistedTablePrefs | null {
    if (typeof window === "undefined") return null;
    try {
        const raw = window.localStorage.getItem(`${KEY_PREFIX}${tableId}`);
        if (!raw) return null;
        return JSON.parse(raw) as PersistedTablePrefs;
    } catch {
        return null;
    }
}

export function savePrefs(tableId: string, prefs: PersistedTablePrefs) {
    if (typeof window === "undefined") return;
    try {
        window.localStorage.setItem(`${KEY_PREFIX}${tableId}`, JSON.stringify(prefs));
    } catch {
        // ignore
    }
}
