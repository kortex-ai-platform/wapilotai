import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { getPublicSettings } from "./index";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Copy } from "lucide-react";

export const Route = createFileRoute("/pay")({
  head: () => ({
    meta: [
      { title: "লাইসেন্স কিনুন — Wapilot AI" },
      { name: "description", content: "bKash বা Nagad-এ payment করে Wapilot AI লাইসেন্স সক্রিয় করুন।" },
      { property: "og:title", content: "লাইসেন্স কিনুন — Wapilot AI" },
      { property: "og:description", content: "bKash বা Nagad-এ payment করে Wapilot AI লাইসেন্স সক্রিয় করুন।" },
    ],
  }),
  component: PayPage,
});

function PayPage() {
  const { data: settings } = useQuery({ queryKey: ["public-settings"], queryFn: () => getPublicSettings() });
  const [waNumber, setWaNumber] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [senderInfo, setSenderInfo] = useState("");
  const [trxId, setTrxId] = useState("");
  const [plan, setPlan] = useState<"monthly" | "yearly" | "lifetime">("monthly");
  const [submitting, setSubmitting] = useState(false);

  const prices: Record<string, string> = {
    monthly: settings?.["price_monthly"] || "950",
    yearly: settings?.["price_yearly"] || "4500",
    lifetime: settings?.["price_lifetime"] || "14500",
  };

  function copy(text: string) {
    navigator.clipboard.writeText(text);
    toast.success("কপি হয়েছে");
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch("/api/public/ext/payment/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          waNumber,
          senderInfo,
          trxId,
          plan,
          amount: prices[plan],
          customerName,
          businessName,
        }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.reason || "ব্যর্থ হয়েছে");
      toast.success("Payment request জমা হয়েছে! যাচাই শেষে আপনার license activate হবে।");
      setTrxId("");
      setSenderInfo("");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "ব্যর্থ হয়েছে");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <main className="mx-auto max-w-2xl space-y-6 px-4 py-16">
        <div className="text-center">
          <h1 className="text-3xl font-bold">লাইসেন্স কিনুন</h1>
          <p className="mt-2 text-muted-foreground">bKash/Nagad-এ Send Money করে নিচের ফর্মটি পূরণ করুন</p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">bKash (Send Money)</CardTitle>
              <CardDescription>{settings?.["bkash_instruction"]}</CardDescription>
            </CardHeader>
            <CardContent>
              <button
                onClick={() => copy(settings?.["bkash_number"] ?? "")}
                className="flex items-center gap-2 font-mono text-2xl font-bold text-primary"
              >
                {settings?.["bkash_number"] || "…"} <Copy className="h-4 w-4" />
              </button>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Nagad (Send Money)</CardTitle>
              <CardDescription>{settings?.["nagad_instruction"]}</CardDescription>
            </CardHeader>
            <CardContent>
              <button
                onClick={() => copy(settings?.["nagad_number"] ?? "")}
                className="flex items-center gap-2 font-mono text-2xl font-bold text-primary"
              >
                {settings?.["nagad_number"] || "…"} <Copy className="h-4 w-4" />
              </button>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Payment তথ্য জমা দিন</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={submit} className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-1">
                  <Label>আপনার WhatsApp নম্বর *</Label>
                  <Input required placeholder="01XXXXXXXXX" value={waNumber} onChange={(e) => setWaNumber(e.target.value)} />
                </div>
                <div className="space-y-1">
                  <Label>আপনার নাম</Label>
                  <Input value={customerName} onChange={(e) => setCustomerName(e.target.value)} />
                </div>
                <div className="space-y-1">
                  <Label>ব্যবসার নাম</Label>
                  <Input value={businessName} onChange={(e) => setBusinessName(e.target.value)} />
                </div>
                <div className="space-y-1">
                  <Label>Plan *</Label>
                  <Select value={plan} onValueChange={(v) => setPlan(v as typeof plan)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="monthly">Monthly — ৳{prices["monthly"]}</SelectItem>
                      <SelectItem value="yearly">Yearly — ৳{prices["yearly"]}</SelectItem>
                      <SelectItem value="lifetime">Lifetime — ৳{prices["lifetime"]}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <Label>যে নম্বর থেকে পাঠিয়েছেন *</Label>
                  <Input required placeholder="bKash/Nagad নম্বর" value={senderInfo} onChange={(e) => setSenderInfo(e.target.value)} />
                </div>
                <div className="space-y-1">
                  <Label>Transaction ID (TrxID) *</Label>
                  <Input required placeholder="যেমন: 9HXK2…" value={trxId} onChange={(e) => setTrxId(e.target.value)} />
                </div>
              </div>
              <Button type="submit" className="w-full" disabled={submitting}>
                {submitting ? "জমা হচ্ছে…" : `জমা দিন — ৳${prices[plan]}`}
              </Button>
            </form>
          </CardContent>
        </Card>

        <div className="text-center">
          <Link to="/" className="text-sm text-muted-foreground hover:text-foreground">
            ← হোমপেজে ফিরে যান
          </Link>
        </div>
      </main>
    </div>
  );
}
