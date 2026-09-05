import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { MessageSquare } from "lucide-react";

export function BrandMark({ compact = false }: { compact?: boolean }) {
  return (
    <div className="flex items-center gap-2.5">
      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[image:var(--gradient-primary)] text-primary-foreground shadow-[var(--glow-primary)]">
        <MessageSquare className="h-4.5 w-4.5" />
      </div>
      <div className="leading-tight">
        <span className="text-base font-bold tracking-tight">Wapilot AI</span>
        {!compact && <p className="text-[10px] text-muted-foreground">WhatsApp Business Automation</p>}
      </div>
    </div>
  );
}

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-border/70 bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3.5">
        <Link to="/">
          <BrandMark />
        </Link>
        <nav className="hidden items-center gap-7 text-sm text-muted-foreground md:flex">
          <a href="#features" className="transition-colors hover:text-foreground">
            Features
          </a>
          <a href="#how" className="transition-colors hover:text-foreground">
            How it works
          </a>
          <a href="#pricing" className="transition-colors hover:text-foreground">
            Pricing
          </a>
          <a href="#faq" className="transition-colors hover:text-foreground">
            FAQ
          </a>
        </nav>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Link to="/auth" className="hidden sm:block">
            <Button size="sm" variant="ghost">
              Admin
            </Button>
          </Link>
          <Link to="/download">
            <Button size="sm">Get started</Button>
          </Link>
        </div>

      </div>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-surface/40">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 md:grid-cols-4">
        <div className="md:col-span-2">
          <BrandMark />
          <p className="mt-3 max-w-sm text-sm text-muted-foreground">
            Automate Conversations. Grow Your Business. — একটি ইউনিফাইড WhatsApp automation platform, browser
            extension ও admin dashboard সহ।
          </p>
        </div>
        <div>
          <p className="mb-3 text-sm font-semibold">Product</p>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>
              <Link to="/download" className="hover:text-foreground">
                Download
              </Link>
            </li>
            <li>
              <Link to="/pay" className="hover:text-foreground">
                Pricing
              </Link>
            </li>
            <li>
              <a href="#faq" className="hover:text-foreground">
                FAQ
              </a>
            </li>
          </ul>
        </div>
        <div>
          <p className="mb-3 text-sm font-semibold">Company</p>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>
              <Link to="/auth" className="hover:text-foreground">
                Admin login
              </Link>
            </li>
            <li>
              <a href="#features" className="hover:text-foreground">
                Use cases
              </a>
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-border py-5 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} Wapilot AI — Professional WhatsApp Automation
      </div>
    </footer>
  );
}
