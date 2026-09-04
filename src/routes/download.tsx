import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Download, Chrome, FolderOpen, ToggleRight, MousePointerClick } from "lucide-react";
import { useState } from "react";
import { SiteHeader, SiteFooter } from "@/components/landing/SiteChrome";
import { toast } from "sonner";

export const Route = createFileRoute("/download")({
  head: () => ({
    meta: [
      { title: "Download Wapilot AI Extension" },
      { name: "description", content: "Wapilot AI Chrome extension ডাউনলোড ও install করার নির্দেশনা।" },
      { property: "og:title", content: "Download Wapilot AI Extension" },
      { property: "og:description", content: "Wapilot AI Chrome extension ডাউনলোড ও install করার নির্দেশনা।" },
    ],
  }),
  component: DownloadPage,
});

const steps = [
  { icon: Download, text: "নিচের বাটন থেকে ZIP ফাইলটা ডাউনলোড করুন" },
  { icon: FolderOpen, text: "ZIP ফাইলটা unzip/extract করুন" },
  { icon: Chrome, text: "Chrome-এ chrome://extensions খুলুন" },
  { icon: ToggleRight, text: "ডান-উপরে Developer mode চালু করুন" },
  { icon: MousePointerClick, text: "Load unpacked ক্লিক করে extract করা ফোল্ডারটি সিলেক্ট করুন" },
];

function DownloadPage() {
  const [downloading, setDownloading] = useState(false);

  const download = () => {
    setDownloading(true);
    fetch("/wapilot-ai.zip")
      .then((res) => {
        if (!res.ok) throw new Error(`Download failed: ${res.status}`);
        return res.blob();
      })
      .then((blob) => {
        const a = document.createElement("a");
        a.href = URL.createObjectURL(blob);
        a.download = "wapilot-ai.zip";
        a.click();
        URL.revokeObjectURL(a.href);
      })
      .catch((err) => toast.error(err.message))
      .finally(() => setDownloading(false));
  };

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="relative mx-auto max-w-2xl px-4 py-16">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-72 hero-glow" />
        <h1 className="relative text-center text-4xl font-extrabold tracking-tight">
          Wapilot AI <span className="gradient-text">Extension</span>
        </h1>
        <p className="relative mt-2 text-center text-muted-foreground">
          Chrome, Edge, Brave, Arc, Opera — যেকোনো Chromium browser-এ চলবে
        </p>
        <div className="relative mt-8 text-center">

          <Button size="lg" onClick={download} disabled={downloading}>
            <Download className="mr-2 h-5 w-5" />
            {downloading ? "ডাউনলোড হচ্ছে…" : "Extension ডাউনলোড (ZIP)"}
          </Button>
        </div>

        <Card className="card-glow relative mt-10">
          <CardHeader>
            <CardTitle>Install করার নিয়ম</CardTitle>
          </CardHeader>
          <CardContent>
            <ol className="space-y-4">
              {steps.map((s, i) => (
                <li key={i} className="flex items-start gap-3">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                    {i + 1}
                  </span>
                  <div className="flex items-center gap-2 pt-1">
                    <s.icon className="h-4 w-4 text-muted-foreground" />
                    <span>{s.text}</span>
                  </div>
                </li>
              ))}
            </ol>
            <p className="mt-6 rounded-lg bg-muted p-3 text-sm text-muted-foreground">
              Install করার পর web.whatsapp.com খুলুন — Wapilot AI প্যানেল নিজে থেকেই চলে আসবে। ৩ দিনের ফ্রি
              trial আপনার WhatsApp নম্বর দিয়ে শুরু হবে।
            </p>
          </CardContent>
        </Card>

        <div className="mt-8 text-center">
          <Link to="/" className="text-sm text-muted-foreground hover:text-foreground">
            ← হোমপেজে ফিরে যান
          </Link>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
