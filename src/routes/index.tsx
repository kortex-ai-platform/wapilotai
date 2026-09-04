import { createFileRoute, Link } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  MessageSquare,
  Send,
  Bot,
  ShoppingCart,
  Bell,
  Download,
  Check,
  Clock,
  CalendarDays,
  Infinity as InfinityIcon,
} from "lucide-react";

const getPublicSettings = createServerFn({ method: "GET" }).handler(async () => {
  const { createClient } = await import("@supabase/supabase-js");
  const key = process.env["SUPABASE_PUBLISHABLE_KEY"]!;
  const supabase = createClient(process.env["SUPABASE_URL"]!, key, {
    auth: { persistSession: false },
    global: {
      fetch: (input, init) => {
        const h = new Headers(init?.headers);
        if (key.startsWith("sb_") && h.get("Authorization") === `Bearer ${key}`) h.delete("Authorization");
        h.set("apikey", key);
        return fetch(input, { ...init, headers: h });
      },
    },
  });
  const { data } = await supabase.from("app_settings").select("key,value");
  const map: Record<string, string> = {};
  for (const row of data ?? []) map[row.key] = row.value ?? "";
  return map;
});

export { getPublicSettings };

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "WaReply Pro — WhatsApp Automation for Business" },
      {
        name: "description",
        content:
          "WaReply Pro দিয়ে WhatsApp-এ broadcast, auto-reply, WooCommerce order alert ও Telegram notification — সব এক Chrome extension-এ।",
      },
      { property: "og:title", content: "WaReply Pro — WhatsApp Automation for Business" },
      {
        property: "og:description",
        content: "Broadcast, auto-reply, WooCommerce orders & Telegram alerts — সব এক জায়গায়।",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: LandingPage,
});

const features = [
  { icon: Send, title: "Bulk Broadcast", desc: "Audience ও template সহ এক ক্লিকে হাজারো মেসেজ, scheduling সহ।" },
  { icon: Bot, title: "Smart Auto-Reply", desc: "Keyword-based অটো রিপ্লাই — কাস্টমার অপেক্ষা করবে না।" },
  { icon: ShoppingCart, title: "WooCommerce Orders", desc: "নতুন order এলেই WhatsApp-এ অটোমেটিক মেসেজ।" },
  { icon: Bell, title: "Telegram Alerts", desc: "গুরুত্বপূর্ণ event-এর নোটিফিকেশন সরাসরি Telegram-এ।" },
];

function LandingPage() {
  const { data: settings } = useQuery({ queryKey: ["public-settings"], queryFn: () => getPublicSettings() });
  const priceMonthly = settings?.["price_monthly"] || "950";
  const priceYearly = settings?.["price_yearly"] || "4500";
  const priceLifetime = settings?.["price_lifetime"] || "14500";

  const plans = [
    {
      icon: Clock,
      name: "Monthly",
      price: priceMonthly,
      period: "/মাস",
      points: ["সব feature", "৩০ দিন validity", "সাপোর্ট"],
    },
    {
      icon: CalendarDays,
      name: "Yearly",
      price: priceYearly,
      period: "/বছর",
      popular: true,
      points: ["সব feature", "৩৬৫ দিন validity", "Priority সাপোর্ট", "ফ্রি আপডেট"],
    },
    {
      icon: InfinityIcon,
      name: "Lifetime",
      price: priceLifetime,
      period: "একবার",
      points: ["সব feature", "আজীবন access", "Lifetime আপডেট", "Priority সাপোর্ট"],
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <MessageSquare className="h-5 w-5" />
            </div>
            <span className="text-lg font-bold">WaReply Pro</span>
          </div>
          <nav className="flex items-center gap-3">
            <Link to="/download" className="text-sm text-muted-foreground hover:text-foreground">
              Download
            </Link>
            <Link to="/pay" className="text-sm text-muted-foreground hover:text-foreground">
              Payment
            </Link>
            <Link to="/auth">
              <Button size="sm" variant="outline">
                Admin
              </Button>
            </Link>
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4">
        <section className="py-16 text-center">
          <h1 className="mx-auto max-w-2xl text-4xl font-extrabold leading-tight tracking-tight md:text-5xl">
            WhatsApp Business Automation — <span className="text-primary">এক Extension-এই সব</span>
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-lg text-muted-foreground">
            Broadcast, auto-reply, WooCommerce order notification আর Telegram alert — আপনার ব্যবসার WhatsApp
            হবে সম্পূর্ণ অটোমেটিক।
          </p>
          <div className="mt-8 flex justify-center gap-3">
            <Link to="/download">
              <Button size="lg">
                <Download className="mr-2 h-5 w-5" /> Extension ডাউনলোড
              </Button>
            </Link>
            <Link to="/pay">
              <Button size="lg" variant="outline">
                লাইসেন্স কিনুন
              </Button>
            </Link>
          </div>
        </section>

        <section className="grid gap-4 pb-16 md:grid-cols-2">
          {features.map((f) => (
            <Card key={f.title}>
              <CardHeader className="flex flex-row items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <f.icon className="h-5 w-5" />
                </div>
                <CardTitle className="text-lg">{f.title}</CardTitle>
              </CardHeader>
              <CardContent className="text-muted-foreground">{f.desc}</CardContent>
            </Card>
          ))}
        </section>

        <section className="pb-20">
          <h2 className="text-center text-3xl font-bold">Pricing</h2>
          <p className="mt-2 text-center text-muted-foreground">৩ দিনের ফ্রি trial — কার্ড ছাড়াই শুরু করুন</p>
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {plans.map((p) => (
              <Card key={p.name} className={p.popular ? "border-primary ring-1 ring-primary" : ""}>
                <CardHeader className="text-center">
                  <p.icon className="mx-auto h-6 w-6 text-primary" />
                  <CardTitle>{p.name}</CardTitle>
                  {p.popular && <span className="text-xs font-semibold text-primary">সবচেয়ে জনপ্রিয়</span>}
                  <div className="mt-2 text-3xl font-extrabold">
                    ৳{p.price}
                    <span className="text-sm font-normal text-muted-foreground"> {p.period}</span>
                  </div>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm">
                    {p.points.map((pt) => (
                      <li key={pt} className="flex items-center gap-2">
                        <Check className="h-4 w-4 text-primary" /> {pt}
                      </li>
                    ))}
                  </ul>
                  <Link to="/pay" className="mt-4 block">
                    <Button className="w-full" variant={p.popular ? "default" : "outline"}>
                      কিনুন
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      </main>

      <footer className="border-t border-border py-6 text-center text-sm text-muted-foreground">
        © {new Date().getFullYear()} WaReply Pro — Professional WhatsApp Automation
      </footer>
    </div>
  );
}
