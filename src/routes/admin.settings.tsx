import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { getSettings, updateSettings } from "@/lib/admin.functions";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useEffect, useState } from "react";

export const Route = createFileRoute("/admin/settings")({
  head: () => ({ meta: [{ title: "Settings — WaReply Pro Admin" }, { name: "robots", content: "noindex" }] }),
  component: SettingsPage,
});

const fields: { key: string; label: string; group: string }[] = [
  { key: "bkash_number", label: "bKash নম্বর", group: "Payment" },
  { key: "nagad_number", label: "Nagad নম্বর", group: "Payment" },
  { key: "bkash_instruction", label: "bKash নির্দেশনা", group: "Payment" },
  { key: "nagad_instruction", label: "Nagad নির্দেশনা", group: "Payment" },
  { key: "price_monthly", label: "Monthly দাম (৳)", group: "Pricing" },
  { key: "price_yearly", label: "Yearly দাম (৳)", group: "Pricing" },
  { key: "price_lifetime", label: "Lifetime দাম (৳)", group: "Pricing" },
  { key: "support_whatsapp", label: "Support WhatsApp", group: "Links" },
  { key: "tutorial_youtube", label: "Tutorial YouTube লিংক", group: "Links" },
  { key: "website_link", label: "Website লিংক", group: "Links" },
  { key: "broadcast_guide", label: "Broadcast Guide লিংক", group: "Links" },
  { key: "update_version", label: "সর্বশেষ ভার্সন", group: "Update" },
  { key: "update_link", label: "Update ডাউনলোড লিংক", group: "Update" },
];

function SettingsPage() {
  const { data } = useQuery({ queryKey: ["admin-settings"], queryFn: () => getSettings() });
  const saveFn = useServerFn(updateSettings);
  const [values, setValues] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (data) setValues(data);
  }, [data]);

  const groups = [...new Set(fields.map((f) => f.group))];

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Settings</h1>
      {groups.map((group) => (
        <Card key={group}>
          <CardHeader>
            <CardTitle className="text-base">{group}</CardTitle>
            <CardDescription>এই মানগুলো extension ও website-এ সরাসরি দেখাবে</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            {fields
              .filter((f) => f.group === group)
              .map((f) => (
                <div key={f.key} className="space-y-1">
                  <Label>{f.label}</Label>
                  <Input
                    value={values[f.key] ?? ""}
                    onChange={(e) => setValues((v) => ({ ...v, [f.key]: e.target.value }))}
                  />
                </div>
              ))}
          </CardContent>
        </Card>
      ))}
      <Button
        disabled={saving}
        onClick={async () => {
          setSaving(true);
          try {
            await saveFn({ data: values });
            toast.success("Settings সংরক্ষিত হয়েছে");
          } catch (e) {
            toast.error(e instanceof Error ? e.message : "ব্যর্থ হয়েছে");
          } finally {
            setSaving(false);
          }
        }}
      >
        {saving ? "সংরক্ষণ হচ্ছে…" : "সব সংরক্ষণ করুন"}
      </Button>
    </div>
  );
}
