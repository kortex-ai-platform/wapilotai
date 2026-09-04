export const PLANS = ["free", "starter", "pro", "business", "lifetime"] as const;
export type Plan = (typeof PLANS)[number];

export const LICENSE_STATUSES = [
  "active",
  "inactive",
  "expired",
  "suspended",
  "revoked",
  "blocked",
] as const;
export type LicenseStatus = (typeof LICENSE_STATUSES)[number];

export const USER_STATUSES = ["active", "pending", "suspended", "banned"] as const;

const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

function randomBlock(len: number) {
  const bytes = crypto.getRandomValues(new Uint8Array(len));
  return Array.from(bytes)
    .map((b) => ALPHABET[b % ALPHABET.length])
    .join("");
}

const PLAN_CODE: Record<Plan, string> = {
  free: "FREE",
  starter: "STRT",
  pro: "PRO",
  business: "BUSI",
  lifetime: "LIFE",
};

/** e.g. WAPI-PRO7-X9K2-7M4Q-8LPA */
export function generateLicenseKey(plan: Plan, durationDays: number | null) {
  const tag = (PLAN_CODE[plan] + (durationDays ? String(durationDays) : "L")).slice(0, 4).padEnd(4, "X");
  return `WAPI-${tag}-${randomBlock(4)}-${randomBlock(4)}-${randomBlock(4)}`;
}

export function normalizeKey(key: string) {
  return key.trim().toUpperCase().replace(/\s+/g, "");
}

export async function hashKey(key: string) {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(normalizeKey(key)));
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export function planLabel(plan: string) {
  return plan.charAt(0).toUpperCase() + plan.slice(1);
}
