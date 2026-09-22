/**
 * Storage adapter replacing window.storage with window.localStorage.
 * Provides fallback in-memory storage if localStorage is restricted/unavailable.
 */

const memoryStore = {};

export async function safeGet(key) {
  try {
    if (typeof window !== "undefined" && window.localStorage) {
      const val = window.localStorage.getItem(`shiftlog_${key}`);
      return val ? val : null;
    }
    return memoryStore[`shiftlog_${key}`] || null;
  } catch (e) {
    console.warn(`[Storage] Read error for key ${key}:`, e);
    return memoryStore[`shiftlog_${key}`] || null;
  }
}

export async function safeSet(key, value) {
  try {
    const stringified = JSON.stringify(value);
    if (typeof window !== "undefined" && window.localStorage) {
      window.localStorage.setItem(`shiftlog_${key}`, stringified);
    }
    memoryStore[`shiftlog_${key}`] = stringified;
    return true;
  } catch (e) {
    console.error(`[Storage] Save error for key ${key}:`, e);
    return false;
  }
}

export async function safeDeleteAll(keys) {
  for (const k of keys) {
    try {
      if (typeof window !== "undefined" && window.localStorage) {
        window.localStorage.removeItem(`shiftlog_${k}`);
      }
      delete memoryStore[`shiftlog_${k}`];
    } catch (e) {
      console.warn(`[Storage] Delete error for key ${k}:`, e);
    }
  }
}

/**
 * Backup Export: Exports all application state to a downloadable JSON file.
 */
export async function exportAllData() {
  const profile = await safeGet("profile");
  const agencies = await safeGet("agencies");
  const shifts = await safeGet("shifts");
  const invoices = await safeGet("invoices");

  const data = {
    version: "1.0",
    exportDate: new Date().toISOString(),
    profile: profile ? JSON.parse(profile) : null,
    agencies: agencies ? JSON.parse(agencies) : [],
    shifts: shifts ? JSON.parse(shifts) : [],
    invoices: invoices ? JSON.parse(invoices) : [],
  };

  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  const dateStr = new Date().toISOString().split("T")[0];
  a.download = `shiftlog-backup-${dateStr}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Backup Import: Restores application state from a JSON backup file.
 */
export async function importBackupData(jsonString) {
  try {
    const parsed = JSON.parse(jsonString);
    if (!parsed || typeof parsed !== "object") {
      throw new Error("Invalid JSON file");
    }

    if (parsed.profile) await safeSet("profile", parsed.profile);
    if (parsed.agencies) await safeSet("agencies", parsed.agencies);
    if (parsed.shifts) await safeSet("shifts", parsed.shifts);
    if (parsed.invoices) await safeSet("invoices", parsed.invoices);

    return { success: true, data: parsed };
  } catch (e) {
    console.error("[Storage] Import error:", e);
    return { success: false, error: e.message };
  }
}
