import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
  "Content-Type": "application/json",
};

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), { status, headers: cors });
}

const waSchema = z.string().regex(/^\+?[0-9]{8,15}$/, "Invalid WhatsApp number");

async function getAdmin() {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  return supabaseAdmin;
}

function addDays(date: Date, days: number) {
  return new Date(date.getTime() + days * 86400000);
}

async function handle(path: string, request: Request): Promise<Response> {
  const supabase = await getAdmin();
  const url = new URL(request.url);

  switch (path) {
    case "trial/start": {
      if (request.method !== "POST") return json({ success: false }, 405);
      const body = z
        .object({
          waNumber: waSchema,
          userName: z.string().max(120).optional(),
          businessName: z.string().max(120).optional(),
        })
        .parse(await request.json());
      const { data: existing } = await supabase
        .from("licenses")
        .select("*")
        .eq("wa_number", body.waNumber)
        .maybeSingle();
      if (existing) {
        if (existing.status === "active" && existing.plan === "trial") {
          const elapsed =
            (Date.now() - new Date(existing.trial_start ?? existing.created_at).getTime()) / 86400000;
          const daysLeft = Math.max(0, (existing.trial_days ?? 3) - Math.floor(elapsed));
          return json({ success: true, valid: daysLeft > 0, daysLeft, isTrial: true });
        }
        return json({ success: false, reason: "Trial already used on this number." });
      }
      const { error } = await supabase.from("licenses").insert({
        wa_number: body.waNumber,
        user_name: body.userName ?? null,
        business_name: body.businessName ?? null,
        plan: "trial",
        status: "active",
        trial_start: new Date().toISOString(),
        trial_days: 3,
      });
      if (error) return json({ success: false, reason: "Server error." }, 500);
      await supabase.from("analytics_events").insert({ wa_number: body.waNumber, event_type: "trial_start" });
      return json({ success: true, valid: true, daysLeft: 3, isTrial: true });
    }

    case "trial/check": {
      const waNumber = waSchema.safeParse(url.searchParams.get("waNumber") ?? "");
      if (!waNumber.success) return json({ valid: false, isNew: true });
      const { data } = await supabase
        .from("licenses")
        .select("*")
        .eq("wa_number", waNumber.data)
        .maybeSingle();
      if (!data) return json({ valid: false, isNew: true, isTrial: false });
      if (data.status === "disabled") return json({ valid: false, isNew: false, reason: "disabled" });
      if (data.plan === "trial") {
        const elapsed =
          (Date.now() - new Date(data.trial_start ?? data.created_at).getTime()) / 86400000;
        const daysLeft = Math.max(0, (data.trial_days ?? 3) - Math.floor(elapsed));
        return json({ valid: daysLeft > 0, isTrial: true, daysLeft, isNew: false });
      }
      if (data.plan === "lifetime")
        return json({ valid: data.status === "active", isTrial: false, daysLeft: 9999, isNew: false });
      const expired = data.expires_at && new Date(data.expires_at) < new Date();
      return json({ valid: !expired && data.status === "active", isTrial: false, isNew: false });
    }

    case "license/verify": {
      const key = z.string().min(4).max(64).safeParse(url.searchParams.get("key") ?? "");
      if (!key.success) return json({ valid: false, reason: "License key required" });
      const { data } = await supabase
        .from("licenses")
        .select("*")
        .eq("license_key", key.data)
        .maybeSingle();
      if (!data) return json({ valid: false, reason: "Invalid license key." });
      if (data.status !== "active") return json({ valid: false, reason: "License expired or disabled." });
      if (data.plan !== "lifetime" && data.expires_at && new Date(data.expires_at) < new Date()) {
        await supabase.from("licenses").update({ status: "expired" }).eq("id", data.id);
        return json({ valid: false, reason: "License has expired." });
      }
      return json({
        valid: true,
        plan: data.plan,
        waNumber: data.wa_number,
        expiresAt: data.expires_at,
      });
    }

    case "license/bind": {
      if (request.method !== "POST") return json({ success: false }, 405);
      const body = z
        .object({ key: z.string().min(4).max(64), waNumber: waSchema })
        .parse(await request.json());
      const { data: lic } = await supabase
        .from("licenses")
        .select("*")
        .eq("license_key", body.key)
        .maybeSingle();
      if (!lic) return json({ success: false, reason: "Invalid license key." });
      if (lic.status !== "active") return json({ success: false, reason: "License not active." });
      if (lic.wa_number !== body.waNumber) {
        // Key belongs to a placeholder row (admin-issued key): bind it to this number
        if (lic.wa_number.startsWith("UNBOUND:")) {
          await supabase
            .from("licenses")
            .update({ wa_number: body.waNumber, activated_at: new Date().toISOString() })
            .eq("id", lic.id);
          await supabase.from("analytics_events").insert({
            wa_number: body.waNumber,
            event_type: "license_bind",
            meta: { plan: lic.plan },
          });
          return json({ success: true, plan: lic.plan });
        }
        return json({ success: false, reason: "Key already bound to another number." });
      }
      return json({ success: true, plan: lic.plan });
    }

    case "license/fetch": {
      const waNumber = waSchema.safeParse(url.searchParams.get("waNumber") ?? "");
      if (!waNumber.success) return json({ valid: false });
      const { data } = await supabase
        .from("licenses")
        .select("*")
        .eq("wa_number", waNumber.data)
        .maybeSingle();
      if (!data || !data.license_key) return json({ valid: false });
      return json({ valid: data.status === "active", key: data.license_key, plan: data.plan });
    }

    case "payment/submit": {
      if (request.method !== "POST") return json({ success: false }, 405);
      const body = z
        .object({
          waNumber: waSchema,
          senderInfo: z.string().max(120).optional(),
          trxId: z.string().min(4).max(40),
          plan: z.enum(["monthly", "yearly", "lifetime"]),
          amount: z.string().max(20).optional(),
          customerName: z.string().max(120).optional(),
          businessName: z.string().max(120).optional(),
        })
        .parse(await request.json());
      const { error } = await supabase.from("payments").insert({
        wa_number: body.waNumber,
        sender_info: body.senderInfo ?? null,
        trx_id: body.trxId,
        plan: body.plan,
        amount: body.amount ?? null,
        customer_name: body.customerName ?? null,
        business_name: body.businessName ?? null,
        status: "pending",
      });
      if (error) return json({ success: false, reason: "Server error." }, 500);
      await supabase.from("analytics_events").insert({
        wa_number: body.waNumber,
        event_type: "payment_submitted",
        meta: { plan: body.plan },
      });
      return json({ success: true });
    }

    case "payment/pending": {
      const waNumber = waSchema.safeParse(url.searchParams.get("waNumber") ?? "");
      if (!waNumber.success) return json({ pending: false });
      const { data } = await supabase
        .from("payments")
        .select("id,status")
        .eq("wa_number", waNumber.data)
        .eq("status", "pending")
        .order("created_at", { ascending: false })
        .limit(1);
      return json({ pending: (data?.length ?? 0) > 0 });
    }

    case "settings/public": {
      const { data } = await supabase.from("app_settings").select("key,value");
      const map: Record<string, string> = {};
      for (const row of data ?? []) map[row.key] = row.value ?? "";
      return json({
        success: true,
        settings: {
          bkashNumber: map["bkash_number"] ?? "",
          nagadNumber: map["nagad_number"] ?? "",
          bkashInstruction: map["bkash_instruction"] ?? "",
          nagadInstruction: map["nagad_instruction"] ?? "",
          priceMonthly: map["price_monthly"] ?? "",
          priceYearly: map["price_yearly"] ?? "",
          priceLifetime: map["price_lifetime"] ?? "",
          supportWhatsapp: map["support_whatsapp"] ?? "",
          tutorialYoutube: map["tutorial_youtube"] ?? "",
          websiteLink: map["website_link"] ?? "",
          updateVersion: map["update_version"] ?? "",
          updateLink: map["update_link"] ?? "",
          broadcastGuideLink: map["broadcast_guide"] ?? "",
        },
      });
    }

    case "events": {
      if (request.method !== "POST") return json({ success: false }, 405);
      const body = z
        .object({
          waNumber: z.string().max(20).optional(),
          type: z.string().min(1).max(60),
          meta: z.record(z.string(), z.any()).optional(),
        })
        .parse(await request.json());
      await supabase.from("analytics_events").insert({
        wa_number: body.waNumber ?? null,
        event_type: body.type,
        meta: (body.meta ?? null) as never,
      });
      return json({ success: true });
    }

    default:
      return json({ success: false, reason: "Unknown endpoint" }, 404);
  }
}

export const Route = createFileRoute("/api/public/ext/$")({
  server: {
    handlers: {
      OPTIONS: async () => new Response(null, { status: 204, headers: cors }),
      GET: async ({ request, params }) => {
        try {
          return await handle(params._splat ?? "", request);
        } catch (e) {
          return json({ success: false, reason: e instanceof z.ZodError ? "Invalid input" : "Server error" }, 400);
        }
      },
      POST: async ({ request, params }) => {
        try {
          return await handle(params._splat ?? "", request);
        } catch (e) {
          return json({ success: false, reason: e instanceof z.ZodError ? "Invalid input" : "Server error" }, 400);
        }
      },
    },
  },
});
