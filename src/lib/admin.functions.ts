import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";

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
    const [lic, pay, ev] = await Promise.all([
      supabase.from("licenses").select("id,plan,status,created_at,expires_at,trial_start,trial_days"),
      supabase.from("payments").select("id,plan,amount,status,created_at"),
      supabase.from("analytics_events").select("id,event_type,created_at"),
    ]);
    const licenses = lic.data ?? [];
    const payments = pay.data ?? [];
    const events = ev.data ?? [];
    const now = Date.now();
    const activePaid = licenses.filter(
      (l: any) =>
        l.status === "active" &&
        l.plan !== "trial" &&
        (l.plan === "lifetime" || !l.expires_at || new Date(l.expires_at).getTime() > now)
    );
    const activeTrials = licenses.filter((l: any) => {
      if (l.plan !== "trial" || l.status !== "active") return false;
      const elapsed = (now - new Date(l.trial_start ?? l.created_at).getTime()) / 86400000;
      return elapsed < (l.trial_days ?? 3);
    });
    const revenue = payments
      .filter((p: any) => p.status === "approved")
      .reduce((s: number, p: any) => s + (parseFloat(p.amount ?? "0") || 0), 0);
    return {
      totalLicenses: licenses.length,
      activePaid: activePaid.length,
      activeTrials: activeTrials.length,
      pendingPayments: payments.filter((p: any) => p.status === "pending").length,
      totalRevenue: revenue,
      totalEvents: events.length,
    };
  });

export const listLicenses = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context as any;
    await assertAdmin(supabase, userId);
    const { data } = await supabase
      .from("licenses")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(500);
    return data ?? [];
  });

export const createLicense = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) =>
    z
      .object({
        plan: z.enum(["monthly", "yearly", "lifetime"]),
        userName: z.string().max(120).optional(),
        businessName: z.string().max(120).optional(),
      })
      .parse(input)
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context as any;
    await assertAdmin(supabase, userId);
    const key =
      "WRP-" +
      Array.from(crypto.getRandomValues(new Uint8Array(8)))
        .map((b) => "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"[b % 32])
        .join("");
    const days = data.plan === "monthly" ? 30 : data.plan === "yearly" ? 365 : null;
    const { error } = await supabase.from("licenses").insert({
      wa_number: `UNBOUND:${key}`,
      license_key: key,
      plan: data.plan,
      status: "active",
      user_name: data.userName ?? null,
      business_name: data.businessName ?? null,
      expires_at: days ? new Date(Date.now() + days * 86400000).toISOString() : null,
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
        status: z.enum(["active", "disabled", "expired"]).optional(),
        plan: z.enum(["trial", "monthly", "yearly", "lifetime"]).optional(),
        extendDays: z.number().min(1).max(3650).optional(),
      })
      .parse(input)
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context as any;
    await assertAdmin(supabase, userId);
    const patch: Record<string, unknown> = {};
    if (data.status) patch["status"] = data.status;
    if (data.plan) patch["plan"] = data.plan;
    if (data.extendDays) {
      const { data: lic } = await supabase.from("licenses").select("expires_at").eq("id", data.id).single();
      const base = lic?.expires_at && new Date(lic.expires_at) > new Date() ? new Date(lic.expires_at) : new Date();
      patch["expires_at"] = new Date(base.getTime() + data.extendDays * 86400000).toISOString();
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
    if (data.action === "approve") {
      const days = payment.plan === "monthly" ? 30 : payment.plan === "yearly" ? 365 : null;
      const key =
        "WRP-" +
        Array.from(crypto.getRandomValues(new Uint8Array(8)))
          .map((b) => "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"[b % 32])
          .join("");
      const { data: existing } = await supabase
        .from("licenses")
        .select("id")
        .eq("wa_number", payment.wa_number)
        .maybeSingle();
      const payload = {
        wa_number: payment.wa_number,
        license_key: key,
        plan: payment.plan ?? "monthly",
        status: "active",
        user_name: payment.customer_name,
        business_name: payment.business_name,
        activated_at: new Date().toISOString(),
        expires_at: days ? new Date(Date.now() + days * 86400000).toISOString() : null,
      };
      if (existing) {
        await supabase.from("licenses").update(payload).eq("id", existing.id);
      } else {
        await supabase.from("licenses").insert(payload);
      }
    }
    return { ok: true };
  });

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
    // Aggregate per-day
    const days: Record<string, { date: string; events: number; revenue: number; users: Set<string> }> = {};
    for (let i = 29; i >= 0; i--) {
      const d = new Date(Date.now() - i * 86400000).toISOString().slice(0, 10);
      days[d] = { date: d, events: 0, revenue: 0, users: new Set() };
    }
    for (const e of events ?? []) {
      const d = e.created_at.slice(0, 10);
      if (days[d]) {
        days[d].events++;
        if (e.wa_number) days[d].users.add(e.wa_number);
      }
    }
    for (const p of payments ?? []) {
      const d = p.created_at.slice(0, 10);
      if (days[d]) days[d].revenue += parseFloat(p.amount ?? "0") || 0;
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
      byType: Object.entries(byType).map(([name, value]) => ({ name, value })),
    };
  });
