import { createFileRoute, Link } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Reveal } from "@/components/Reveal";
import { SiteHeader, SiteFooter } from "@/components/landing/SiteChrome";
import { DashboardPreview } from "@/components/landing/DashboardPreview";
import {
  Send,
  Bot,
  ShoppingCart,
  Bell,
  Download,
  Check,
  Clock,
  CalendarDays,
  Infinity as InfinityIcon,
  ShieldCheck,
  BarChart3,
  ArrowRight,
  Puzzle,
  KeyRound,
  Rocket,
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
      { title: "Wapilot AI — Automate Conversations. Grow Your Business." },
      {
        name: "description",
        content:
          "Wapilot AI দিয়ে WhatsApp-এ broadcast, auto-reply, WooCommerce order alert ও Telegram notification — সব এক Chrome extension ও admin dashboard-এ।",
      },
      { property: "og:title", content: "Wapilot AI — Automate Conversations. Grow Your Business." },
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

const useCases = [
  { icon: Send, title: "Bulk Broadcast", desc: "Audience ও template সহ এক ক্লিকে হাজারো মেসেজ, scheduling সহ।" },
  { icon: Bot, title: "Smart Auto-Reply", desc: "Keyword-based অটো রিপ্লাই — কাস্টমার আর অপেক্ষা করবে না।" },
  { icon: ShoppingCart, title: "WooCommerce Orders", desc: "নতুন order এলেই WhatsApp-এ অটোমেটিক কনফার্মেশন।" },
  { icon: Bell, title: "Telegram Alerts", desc: "গুরুত্বপূর্ণ event-এর নোটিফিকেশন সরাসরি Telegram-এ।" },
  { icon: ShieldCheck, title: "License Control", desc: "Device limit, suspend, revoke — পুরো নিয়ন্ত্রণ আপনার হাতে।" },
  { icon: BarChart3, title: "Analytics & Reports", desc: "Delivery, usage ও revenue — এক ড্যাশবোর্ডে পরিষ্কার ছবি।" },
];

const steps = [
  { icon: Puzzle, title: "Install Extension", desc: "Chrome-এ Wapilot AI extension যোগ করুন, এক মিনিটেই সেটআপ।" },
  { icon: KeyRound, title: "Activate License", desc: "License key দিন — backend যাচাই করে device bind করবে।" },
  { icon: Rocket, title: "Automate & Grow", desc: "Broadcast, auto-reply ও order alert চালু করে বিক্রি বাড়ান।" },
];

const faqs = [
  {
    q: "License key ছাড়া extension চলবে?",
    a: "না। প্রতিটি feature license verification-এর পরেই আনলক হয়। key invalid বা expired হলে extension block থাকবে।",
  },
  {
    q: "একটি key কয়টি device-এ ব্যবহার করা যাবে?",
    a: "Plan অনুযায়ী ১, ২, ৫ বা ১০ device। Admin panel থেকে device reset বা remove করা যায়।",
  },
  { q: "WhatsApp Business API লাগবে?", a: "না, Wapilot AI সরাসরি WhatsApp Web-এর উপর ব্রাউজার থেকেই কাজ করে।" },
  { q: "আমার ডেটা কোথায় থাকে?", a: "কনট্যাক্ট ও মেসেজ ডেটা আপনার ব্রাউজারে থাকে; শুধু license যাচাই server-এ হয়।" },
  { q: "পেমেন্ট কীভাবে করব?", a: "bKash/Nagad/ব্যাংক — Payment পেজে তথ্য দিলে যাচাইয়ের পর key ইস্যু করা হয়।" },
];

function LandingPage() {
  const { data: settings } = useQuery({ queryKey: ["public-settings"], queryFn: () => getPublicSettings() });
  const priceMonthly = settings?.["price_monthly"] || "950";
  const priceYearly = settings?.["price_yearly"] || "4500";
  const priceLifetime = settings?.["price_lifetime"] || "14500";

  const plans = [
    { icon: Clock, name: "Monthly", price: priceMonthly, period: "/মাস", points: ["সব feature", "৩০ দিন validity", "১ device", "সাপোর্ট"] },
    {
      icon: CalendarDays,
      name: "Yearly",
      price: priceYearly,
      period: "/বছর",
      popular: true,
      points: ["সব feature", "৩৬৫ দিন validity", "২ device", "Priority সাপোর্ট", "ফ্রি আপডেট"],
    },
    {
      icon: InfinityIcon,
      name: "Lifetime",
      price: priceLifetime,
      period: "একবার",
      points: ["সব feature", "আজীবন access", "৫ device", "Lifetime আপডেট", "Priority সাপোর্ট"],
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader landing />

      <main>
        {/* Hero */}
        <section className="relative overflow-hidden border-b border-border/50">
          <div className="pointer-events-none absolute inset-0 landing-grid opacity-40" />
          <div className="pointer-events-none absolute inset-x-0 top-0 h-[680px] hero-glow" />
          <div className="relative mx-auto max-w-7xl px-4 pt-16 pb-16 text-center sm:px-6 md:pt-24">
            <Reveal>
              <span className="glass-panel inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs text-muted-foreground">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-success" /> AI-powered WhatsApp business automation
              </span>
            </Reveal>
            <Reveal delay={80}>
              <h1 className="mx-auto mt-7 max-w-4xl text-4xl font-extrabold leading-[1.12] tracking-normal sm:text-5xl md:text-7xl">
                আপনার ব্যবসাকে আরও স্মার্ট করুন <span className="gradient-text">Wapilot AI</span> এর সাথে
              </h1>
            </Reveal>
            <Reveal delay={160}>
              <p className="mx-auto mt-6 max-w-2xl text-base leading-7 text-muted-foreground md:text-lg">
                Broadcast, smart auto-reply, WooCommerce order alert ও customer conversation—সবকিছু একটি নিরাপদ browser-based automation platform-এ।
              </p>
            </Reveal>
            <Reveal delay={240}>
              <div className="mt-9 flex flex-wrap justify-center gap-3">
                <Link to="/download">
                  <Button size="lg" className="button-shine h-12 px-7 shadow-[var(--glow-primary)]">
                    <Download className="mr-2 h-5 w-5" /> Extension ডাউনলোড
                  </Button>
                </Link>
                <Link to="/pay">
                  <Button size="lg" variant="outline" className="h-12 bg-background/30 px-7 backdrop-blur-md">
                    লাইসেন্স কিনুন <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </Reveal>

            <Reveal delay={300}>
              <div className="mt-6 flex flex-wrap justify-center gap-x-6 gap-y-2 text-xs text-muted-foreground">
                {["Secure license verification", "No card required", "Setup in minutes"].map((item) => (
                  <span key={item} className="flex items-center gap-1.5"><Check className="h-3.5 w-3.5 text-success" />{item}</span>
                ))}
              </div>
            </Reveal>
            <Reveal delay={360}>
              <div className="glass-panel mx-auto mt-14 grid max-w-4xl grid-cols-2 gap-px overflow-hidden rounded-lg md:grid-cols-4">
                {[
                  { value: "License", label: "Backend verified" },
                  { value: "Device", label: "Securely bound" },
                  { value: "Browser", label: "Local data" },
                  { value: "Admin", label: "Full control" },
                ].map((item) => (
                  <div key={item.label} className="bg-surface/75 px-4 py-5">
                    <p className="text-lg font-extrabold text-primary">{item.value}</p>
                    <p className="mt-1 text-xs text-muted-foreground">{item.label}</p>
                  </div>
                ))}
              </div>
            </Reveal>
          </div>
        </section>

        {/* Dashboard preview */}
        <section className="mx-auto max-w-7xl px-4 py-24 sm:px-6">
          <Reveal className="text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-success">Live command center</p>
            <h2 className="mt-3 text-3xl font-bold md:text-4xl">
              Your control panel, <span className="gradient-text">beautifully crafted</span>
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-muted-foreground">
              User, license, device ও revenue — সবকিছু একটি পরিষ্কার corporate dashboard-এ।
            </p>
          </Reveal>
          <Reveal delay={120} className="mx-auto mt-12 max-w-6xl">
            <DashboardPreview />
          </Reveal>
        </section>

        {/* How it works */}
        <section id="how" className="border-y border-border/50 bg-surface/35 py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <Reveal className="text-center">
            <p className="text-xs uppercase tracking-[0.25em] text-success">Process</p>
            <h2 className="mt-3 text-3xl font-bold md:text-4xl">
              How it <span className="gradient-text">works</span>
            </h2>
          </Reveal>
          <div className="mt-10 grid gap-4 md:grid-cols-3">
            {steps.map((s, i) => (
              <Reveal key={s.title} delay={i * 100}>
                <div className="card-glow h-full rounded-lg p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/12 text-primary">
                      <s.icon className="h-5 w-5" />
                    </div>
                    <span className="text-3xl font-black text-border">0{i + 1}</span>
                  </div>
                  <h3 className="mt-5 text-lg font-semibold">{s.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{s.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
          <div className="mt-10 text-center"><Link to="/download"><Button className="button-shine">শুরু করুন <ArrowRight /></Button></Link></div>
          </div>
        </section>

        {/* Use cases */}
        <section id="features" className="mx-auto max-w-7xl px-4 py-24 sm:px-6">
          <Reveal className="text-center">
            <p className="text-xs uppercase tracking-[0.25em] text-success">Capabilities</p>
            <h2 className="mt-3 text-3xl font-bold md:text-4xl">
              Built for <span className="gradient-text">every use case</span>
            </h2>
          </Reveal>
          <div className="mt-10 grid gap-4 md:grid-cols-3">
            {useCases.map((f, i) => (
              <Reveal key={f.title} delay={(i % 3) * 90}>
                <div className="card-glow h-full rounded-lg p-6">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-success/12 text-success">
                    <f.icon className="h-5 w-5" />
                  </div>
                  <h3 className="mt-5 text-lg font-semibold">{f.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{f.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </section>

        {/* Pricing */}
        <section id="pricing" className="border-y border-border/50 bg-surface/35 py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <Reveal className="text-center">
            <p className="text-xs uppercase tracking-[0.25em] text-success">Pricing</p>
            <h2 className="mt-3 text-3xl font-bold md:text-4xl">
              Simple, transparent <span className="gradient-text">pricing</span>
            </h2>
            <p className="mt-3 text-muted-foreground">৩ দিনের ফ্রি trial — কার্ড ছাড়াই শুরু করুন</p>
          </Reveal>
          <div className="mt-10 grid gap-4 md:grid-cols-3">
            {plans.map((p, i) => (
              <Reveal key={p.name} delay={i * 100}>
                <div
                   className={`card-glow relative h-full rounded-lg p-6 ${
                    p.popular ? "border-primary/60 shadow-[var(--glow-primary)]" : ""
                  }`}
                >
                  {p.popular && (
                    <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-[image:var(--gradient-primary)] px-3 py-1 text-[10px] font-semibold uppercase tracking-wide text-primary-foreground">
                      Most popular
                    </span>
                  )}
                  <div className="text-center">
                    <p.icon className="mx-auto h-6 w-6 text-primary" />
                    <h3 className="mt-3 text-lg font-semibold">{p.name}</h3>
                    <div className="mt-3 text-4xl font-extrabold">
                      ৳{p.price}
                      <span className="text-sm font-normal text-muted-foreground"> {p.period}</span>
                    </div>
                  </div>
                  <ul className="mt-6 space-y-2.5 text-sm">
                    {p.points.map((pt) => (
                      <li key={pt} className="flex items-center gap-2">
                        <Check className="h-4 w-4 shrink-0 text-success" /> {pt}
                      </li>
                    ))}
                  </ul>
                  <Link to="/pay" className="mt-6 block">
                    <Button className="w-full" variant={p.popular ? "default" : "outline"}>
                      কিনুন
                    </Button>
                  </Link>
                </div>
              </Reveal>
            ))}
          </div>
          </div>
        </section>

        {/* FAQ */}
        <section id="faq" className="mx-auto max-w-3xl px-4 py-24">
          <Reveal className="text-center">
            <p className="text-xs uppercase tracking-[0.25em] text-success">Support</p>
            <h2 className="mt-3 text-3xl font-bold md:text-4xl">
              Frequently asked <span className="gradient-text">questions</span>
            </h2>
          </Reveal>
          <Reveal delay={120} className="mt-8">
            <Accordion type="single" collapsible className="glass-panel rounded-lg px-4">
              {faqs.map((f) => (
                <AccordionItem key={f.q} value={f.q}>
                  <AccordionTrigger className="text-left text-sm">{f.q}</AccordionTrigger>
                  <AccordionContent className="text-sm text-muted-foreground">{f.a}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </Reveal>
        </section>

        {/* Final CTA */}
        <section className="mx-auto max-w-7xl px-4 pb-24 sm:px-6">
          <Reveal>
            <div className="glass-panel relative overflow-hidden rounded-lg p-8 text-left sm:p-12">
              <div className="pointer-events-none absolute inset-0 hero-glow" />
              <div className="relative grid items-center gap-8 lg:grid-cols-[1fr_auto]">
                <div><h2 className="text-3xl font-extrabold md:text-4xl">
                  Fast, easy, affordable <span className="gradient-text">WhatsApp automation</span>
                </h2>
                <p className="mt-3 max-w-xl text-muted-foreground">
                  আজই Wapilot AI চালু করুন — ইনস্টল, অ্যাক্টিভেট, অটোমেট।
                </p>
                </div><div className="flex flex-wrap gap-3 lg:justify-end">
                  <Link to="/download">
                    <Button size="lg">
                      <Download className="mr-2 h-5 w-5" /> এখনই ডাউনলোড
                    </Button>
                  </Link>
                  <Link to="/pay">
                    <Button size="lg" variant="outline">
                      Pricing দেখুন
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </Reveal>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
