import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { hashKey } from "@/lib/license-utils";

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

    // ---- Secure license activation / validation (hashed keys + device binding) ----
    case "license/activate":
    case "license/validate": {
      if (request.method !== "POST") return json({ valid: false }, 405);
      const body = z
        .object({
          key: z.string().min(8).max(64),
          deviceId: z.string().min(6).max(120),
          label: z.string().max(120).optional(),
          waNumber: z.string().max(20).optional(),
        })
        .parse(await request.json());

      const hash = await hashKey(body.key);
      const { data: lic } = await supabase.from("licenses").select("*").eq("key_hash", hash).maybeSingle();
      if (!lic) return json({ valid: false, status: "invalid", reason: "Invalid Wapilot AI license key." });

      const blockedStatuses: Record<string, string> = {
        revoked: "This license has been revoked.",
        blocked: "This license is blocked.",
        suspended: "This license is suspended. Contact support.",
        expired: "This license has expired.",
      };
      if (blockedStatuses[lic.status])
        return json({ valid: false, status: lic.status, reason: blockedStatuses[lic.status] });

      const isActivation = path === "license/activate";
      let status = lic.status;
      let expiresAt = lic.expires_at as string | null;

      if (status === "inactive") {
        if (!isActivation)
          return json({ valid: false, status: "inactive", reason: "License is not activated yet." });
        status = "active";
        expiresAt = lic.duration_days ? addDays(new Date(), lic.duration_days).toISOString() : null;
      }

      if (lic.plan !== "lifetime" && expiresAt && new Date(expiresAt) < new Date()) {
        await supabase.from("licenses").update({ status: "expired" }).eq("id", lic.id);
        return json({ valid: false, status: "expired", reason: "This license has expired." });
      }

      const { data: device } = await supabase
        .from("license_devices")
        .select("id")
        .eq("license_id", lic.id)
        .eq("device_id", body.deviceId)
        .maybeSingle();

      if (!device) {
        if (!isActivation)
          return json({ valid: false, status: "unbound", reason: "Device not activated for this license." });
        const { count } = await supabase
          .from("license_devices")
          .select("id", { count: "exact", head: true })
          .eq("license_id", lic.id);
        if ((count ?? 0) >= (lic.max_devices ?? 1))
          return json({
            valid: false,
            status: "device_limit",
            reason: `Device limit reached (${count}/${lic.max_devices}). Deactivate another device first.`,
          });
        await supabase.from("license_devices").insert({
          license_id: lic.id,
          device_id: body.deviceId,
          label: body.label ?? null,
          wa_number: body.waNumber ?? null,
        });
      } else {
        await supabase
          .from("license_devices")
          .update({ last_seen: new Date().toISOString(), wa_number: body.waNumber ?? null })
          .eq("id", device.id);
      }

      const { count: used } = await supabase
        .from("license_devices")
        .select("id", { count: "exact", head: true })
        .eq("license_id", lic.id);

      await supabase
        .from("licenses")
        .update({
          status,
          expires_at: expiresAt,
          activated_at: lic.activated_at ?? new Date().toISOString(),
          current_devices: used ?? 0,
          last_validation: new Date().toISOString(),
          wa_number: lic.wa_number ?? body.waNumber ?? null,
        })
        .eq("id", lic.id);

      if (isActivation && lic.status === "inactive")
        await supabase.from("analytics_events").insert({
          wa_number: body.waNumber ?? null,
          event_type: "license_activated",
          meta: { plan: lic.plan },
        });

      return json({
        valid: true,
        status: "active",
        plan: lic.plan,
        user: lic.user_name ?? null,
        business: lic.business_name ?? null,
        expiresAt: lic.plan === "lifetime" ? null : expiresAt,
        devices: { used: used ?? 0, max: lic.max_devices ?? 1 },
      });
    }

    case "license/deactivate": {
      if (request.method !== "POST") return json({ success: false }, 405);
      const body = z
        .object({ key: z.string().min(8).max(64), deviceId: z.string().min(6).max(120) })
        .parse(await request.json());
      const hash = await hashKey(body.key);
      const { data: lic } = await supabase.from("licenses").select("id").eq("key_hash", hash).maybeSingle();
      if (!lic) return json({ success: false, reason: "Invalid license key." });
      await supabase.from("license_devices").delete().eq("license_id", lic.id).eq("device_id", body.deviceId);
      const { count } = await supabase
        .from("license_devices")
        .select("id", { count: "exact", head: true })
        .eq("license_id", lic.id);
      await supabase.from("licenses").update({ current_devices: count ?? 0 }).eq("id", lic.id);
      return json({ success: true, devices: { used: count ?? 0 } });
    }

    case "device/list": {
      if (request.method !== "POST") return json({ success: false }, 405);
      const body = z.object({ key: z.string().min(8).max(64) }).parse(await request.json());
      const hash = await hashKey(body.key);
      const { data: lic } = await supabase
        .from("licenses")
        .select("id,max_devices")
        .eq("key_hash", hash)
        .maybeSingle();
      if (!lic) return json({ success: false, reason: "Invalid license key." });
      const { data: devices } = await supabase
        .from("license_devices")
        .select("device_id,label,last_seen")
        .eq("license_id", lic.id);
      return json({ success: true, max: lic.max_devices, devices: devices ?? [] });
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
