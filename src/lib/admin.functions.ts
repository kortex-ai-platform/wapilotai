import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";
import { generateLicenseKey, hashKey, PLANS, LICENSE_STATUSES, USER_STATUSES } from "@/lib/license-utils";

async function assertAdmin(supabase: any, userId: string) {
  const { data } = await supabase.rpc("has_role", { _user_id: userId, _role: "admin" });
  if (!data) throw new Error("Forbidden: admin only");
}

export const checkIsAdmin = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context as any;
    const { data } = await supabase.rpc("has_role", { _user_id: userId, _role: "admin" });
    return { isAdmin: !!data };
  });

export const getOverview = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context as any;
    await assertAdmin(supabase, userId);
    const [lic, pay, ev, usr, dev] = await Promise.all([
      supabase.from("licenses").select("id,plan,status,created_at,expires_at,trial_start,trial_days"),
      supabase.from("payments").select("id,plan,amount,status,created_at"),
      supabase.from("analytics_events").select("id,event_type,created_at"),
      supabase.from("app_users").select("id,status"),
      supabase.from("license_devices").select("id"),
    ]);
    const licenses = lic.data ?? [];
    const payments = pay.data ?? [];
    const now = Date.now();
    const active = licenses.filter(
      (l: any) =>
        l.status === "active" &&
        (l.plan === "lifetime" || !l.expires_at || new Date(l.expires_at).getTime() > now)
    );
    const revenue = payments
      .filter((p: any) => p.status === "approved")
      .reduce((s: number, p: any) => s + (parseFloat(p.amount ?? "0") || 0), 0);
    return {
      totalLicenses: licenses.length,
      activeLicenses: active.length,
      unusedLicenses: licenses.filter((l: any) => l.status === "inactive").length,
      totalUsers: (usr.data ?? []).length,
      activeUsers: (usr.data ?? []).filter((u: any) => u.status === "active").length,
      totalDevices: (dev.data ?? []).length,
      pendingPayments: payments.filter((p: any) => p.status === "pending").length,
      totalRevenue: revenue,
      totalEvents: (ev.data ?? []).length,
    };
  });

/* ---------------- Licenses ---------------- */

export const listLicenses = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context as any;
    await assertAdmin(supabase, userId);
    const { data } = await supabase
      .from("licenses")
      .select("*, app_users(id,name,email,phone)")
      .order("created_at", { ascending: false })
      .limit(500);
    return data ?? [];
  });

export const createLicense = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) =>
    z
      .object({
        plan: z.enum(PLANS),
        durationDays: z.number().int().positive().nullable(),
        maxDevices: z.number().int().min(1).max(10),
        appUserId: z.string().uuid().nullable().optional(),
        userName: z.string().max(120).optional(),
        businessName: z.string().max(120).optional(),
      })
      .parse(input)
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context as any;
    await assertAdmin(supabase, userId);
    const duration = data.plan === "lifetime" ? null : data.durationDays;
    const key = generateLicenseKey(data.plan, duration);
    const key_hash = await hashKey(key);
    const { error } = await supabase.from("licenses").insert({
      license_key: null,
      key_hash,
      key_prefix: key.slice(0, 9),
      plan: data.plan,
      status: "inactive",
      max_devices: data.maxDevices,
      current_devices: 0,
      duration_days: duration,
      app_user_id: data.appUserId ?? null,
      user_name: data.userName ?? null,
      business_name: data.businessName ?? null,
    });
    if (error) throw new Error(error.message);
    return { key };
  });

export const updateLicense = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) =>
    z
      .object({
        id: z.number(),
        status: z.enum(LICENSE_STATUSES).optional(),
        plan: z.enum(PLANS).optional(),
        maxDevices: z.number().int().min(1).max(10).optional(),
        appUserId: z.string().uuid().nullable().optional(),
        extendDays: z.number().min(1).max(3650).optional(),
        resetDevices: z.boolean().optional(),
      })
      .parse(input)
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context as any;
    await assertAdmin(supabase, userId);
    const patch: Record<string, unknown> = {};
    if (data.status) {
      patch["status"] = data.status;
      if (data.status === "revoked") patch["revoked_at"] = new Date().toISOString();
    }
    if (data.plan) patch["plan"] = data.plan;
    if (data.maxDevices) patch["max_devices"] = data.maxDevices;
    if (data.appUserId !== undefined) patch["app_user_id"] = data.appUserId;
    if (data.extendDays) {
      const { data: lic } = await supabase.from("licenses").select("expires_at").eq("id", data.id).single();
      const base = lic?.expires_at && new Date(lic.expires_at) > new Date() ? new Date(lic.expires_at) : new Date();
      patch["expires_at"] = new Date(base.getTime() + data.extendDays * 86400000).toISOString();
    }
    if (data.resetDevices) {
      await supabase.from("license_devices").delete().eq("license_id", data.id);
      patch["current_devices"] = 0;
    }
    const { error } = await supabase.from("licenses").update(patch).eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const deleteLicense = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => z.object({ id: z.number() }).parse(input))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context as any;
    await assertAdmin(supabase, userId);
    await supabase.from("licenses").delete().eq("id", data.id);
    return { ok: true };
  });

export const listDevices = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => z.object({ licenseId: z.number() }).parse(input))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context as any;
    await assertAdmin(supabase, userId);
    const { data: rows } = await supabase
      .from("license_devices")
      .select("*")
      .eq("license_id", data.licenseId)
      .order("last_seen", { ascending: false });
    return rows ?? [];
  });

export const removeDevice = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => z.object({ id: z.string().uuid(), licenseId: z.number() }).parse(input))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context as any;
    await assertAdmin(supabase, userId);
    await supabase.from("license_devices").delete().eq("id", data.id);
    const { count } = await supabase
      .from("license_devices")
      .select("id", { count: "exact", head: true })
      .eq("license_id", data.licenseId);
    await supabase.from("licenses").update({ current_devices: count ?? 0 }).eq("id", data.licenseId);
    return { ok: true };
  });

/* ---------------- Users ---------------- */

export const listUsers = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context as any;
    await assertAdmin(supabase, userId);
    const { data } = await supabase
      .from("app_users")
      .select("*, licenses(id,plan,status,expires_at,current_devices,max_devices,key_prefix)")
      .order("created_at", { ascending: false })
      .limit(500);
    return data ?? [];
  });

export const upsertUser = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) =>
    z
      .object({
        id: z.string().uuid().optional(),
        name: z.string().max(120).optional(),
        email: z.string().email().max(200).optional().or(z.literal("")),
        phone: z.string().max(30).optional(),
        status: z.enum(USER_STATUSES).optional(),
        notes: z.string().max(1000).optional(),
      })
      .parse(input)
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context as any;
    await assertAdmin(supabase, userId);
    const payload: Record<string, unknown> = {
      name: data.name ?? null,
      email: data.email || null,
      phone: data.phone ?? null,
      notes: data.notes ?? null,
    };
    if (data.status) payload["status"] = data.status;
    if (data.id) {
      const { error } = await supabase.from("app_users").update(payload).eq("id", data.id);
      if (error) throw new Error(error.message);
      return { id: data.id };
    }
    const { data: row, error } = await supabase.from("app_users").insert(payload).select("id").single();
    if (error) throw new Error(error.message);
    return { id: row.id as string };
  });

export const setUserStatus = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) =>
    z.object({ id: z.string().uuid(), status: z.enum(USER_STATUSES) }).parse(input)
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context as any;
    await assertAdmin(supabase, userId);
    await supabase.from("app_users").update({ status: data.status }).eq("id", data.id);
    if (data.status === "banned" || data.status === "suspended") {
      await supabase
        .from("licenses")
        .update({ status: data.status === "banned" ? "blocked" : "suspended" })
        .eq("app_user_id", data.id);
    }
    return { ok: true };
  });

export const deleteUser = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => z.object({ id: z.string().uuid() }).parse(input))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context as any;
    await assertAdmin(supabase, userId);
    await supabase.from("app_users").delete().eq("id", data.id);
    return { ok: true };
  });

/* ---------------- Payments ---------------- */

export const listPayments = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context as any;
    await assertAdmin(supabase, userId);
    const { data } = await supabase
      .from("payments")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(500);
    return data ?? [];
  });

export const reviewPayment = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) =>
    z.object({ id: z.number(), action: z.enum(["approve", "reject"]) }).parse(input)
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context as any;
    await assertAdmin(supabase, userId);
    const { data: payment } = await supabase.from("payments").select("*").eq("id", data.id).single();
    if (!payment) throw new Error("Payment not found");
    await supabase
      .from("payments")
      .update({ status: data.action === "approve" ? "approved" : "rejected" })
      .eq("id", data.id);
    if (data.action !== "approve") return { ok: true };

    const plan = (payment.plan === "monthly" ? "starter" : payment.plan === "yearly" ? "pro" : payment.plan) ?? "starter";
    const duration = plan === "lifetime" ? null : plan === "pro" ? 365 : 30;
    const key = generateLicenseKey(plan as any, duration);
    const key_hash = await hashKey(key);
    const { error } = await supabase.from("licenses").insert({
      key_hash,
      key_prefix: key.slice(0, 9),
      wa_number: payment.wa_number,
      plan,
      status: "inactive",
      max_devices: 1,
      duration_days: duration,
      user_name: payment.customer_name,
      business_name: payment.business_name,
    });
    if (error) throw new Error(error.message);
    return { ok: true, key };
  });

/* ---------------- Settings & analytics ---------------- */

export const getSettings = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context as any;
    await assertAdmin(supabase, userId);
    const { data } = await supabase.from("app_settings").select("key,value");
    const map: Record<string, string> = {};
    for (const row of data ?? []) map[row.key] = row.value ?? "";
    return map;
  });

export const updateSettings = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => z.record(z.string(), z.string().max(500)).parse(input))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context as any;
    await assertAdmin(supabase, userId);
    for (const [key, value] of Object.entries(data)) {
      await supabase.from("app_settings").upsert({ key, value });
    }
    return { ok: true };
  });

export const getAnalytics = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context as any;
    await assertAdmin(supabase, userId);
    const since = new Date(Date.now() - 30 * 86400000).toISOString();
    const { data: events } = await supabase
      .from("analytics_events")
      .select("wa_number,event_type,created_at")
      .gte("created_at", since)
      .order("created_at", { ascending: true })
      .limit(5000);
    const { data: payments } = await supabase
      .from("payments")
      .select("amount,status,created_at")
      .eq("status", "approved")
      .gte("created_at", since);

    const days: Record<string, { date: string; events: number; revenue: number; users: Set<string> }> = {};
    for (let i = 29; i >= 0; i--) {
      const d = new Date(Date.now() - i * 86400000).toISOString().slice(0, 10);
      days[d] = { date: d, events: 0, revenue: 0, users: new Set() };
    }
    for (const e of events ?? []) {
      const d = (e.created_at as string).slice(0, 10);
      const bucket = days[d];
      if (!bucket) continue;
      bucket.events += 1;
      if (e.wa_number) bucket.users.add(e.wa_number);
    }
    for (const p of payments ?? []) {
      const d = (p.created_at as string).slice(0, 10);
      const bucket = days[d];
      if (bucket) bucket.revenue += parseFloat(p.amount ?? "0") || 0;
    }
    const byType: Record<string, number> = {};
    for (const e of events ?? []) byType[e.event_type] = (byType[e.event_type] ?? 0) + 1;

    return {
      daily: Object.values(days).map((d) => ({
        date: d.date.slice(5),
        events: d.events,
        revenue: d.revenue,
        users: d.users.size,
      })),
      byType: Object.entries(byType).map(([type, count]) => ({ type, count })),
    };
  });
