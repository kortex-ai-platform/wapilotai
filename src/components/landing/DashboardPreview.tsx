import { Activity, BarChart3, KeyRound, Users, Send, Bot } from "lucide-react";

const bars = [42, 68, 55, 82, 60, 95, 74, 88, 63, 79, 91, 70];

export function DashboardPreview() {
  return (
    <div className="relative">
      <div className="pointer-events-none absolute -inset-10 rounded-[2rem] bg-[image:var(--gradient-hero)] blur-2xl" />
      <div className="relative overflow-hidden rounded-2xl border border-border bg-surface shadow-[var(--shadow-elevated)]">
        <div className="flex items-center gap-2 border-b border-border bg-background/60 px-4 py-2.5">
          <span className="h-2.5 w-2.5 rounded-full bg-destructive/70" />
          <span className="h-2.5 w-2.5 rounded-full bg-warning/70" />
          <span className="h-2.5 w-2.5 rounded-full bg-accent/70" />
          <span className="ml-3 text-xs text-muted-foreground">wapilot.ai / admin</span>
        </div>
        <div className="grid grid-cols-[170px_1fr] max-sm:grid-cols-1">
          <aside className="border-r border-border bg-background/40 p-3 text-sm max-sm:hidden">
            {[
              { icon: BarChart3, label: "Overview", active: true },
              { icon: Users, label: "Users" },
              { icon: KeyRound, label: "Licenses" },
              { icon: Send, label: "Broadcast" },
              { icon: Bot, label: "Auto-reply" },
              { icon: Activity, label: "Analytics" },
            ].map((i) => (
              <div
                key={i.label}
                className={`mb-1 flex items-center gap-2 rounded-lg px-2.5 py-2 text-xs ${
                  i.active ? "bg-primary/15 text-primary" : "text-muted-foreground"
                }`}
              >
                <i.icon className="h-3.5 w-3.5" />
                {i.label}
              </div>
            ))}
          </aside>
          <div className="p-4">
            <div className="grid grid-cols-3 gap-3 max-sm:grid-cols-2">
              {[
                { l: "Active users", v: "2,148", d: "+12%" },
                { l: "Active licenses", v: "1,376", d: "+8%" },
                { l: "Messages sent", v: "84,920", d: "+23%" },
              ].map((s) => (
                <div key={s.l} className="rounded-xl border border-border bg-card p-3">
                  <p className="text-[10px] uppercase tracking-wide text-muted-foreground">{s.l}</p>
                  <p className="mt-1 text-lg font-bold">{s.v}</p>
                  <p className="text-[10px] text-accent">{s.d}</p>
                </div>
              ))}
            </div>
            <div className="mt-3 rounded-xl border border-border bg-card p-4">
              <p className="mb-3 text-xs text-muted-foreground">Message volume — last 12 weeks</p>
              <div className="flex h-28 items-end gap-1.5">
                {bars.map((b, i) => (
                  <div
                    key={i}
                    style={{ height: `${b}%` }}
                    className="flex-1 rounded-t-sm bg-[image:var(--gradient-primary)] opacity-80"
                  />
                ))}
              </div>
            </div>
            <div className="mt-3 rounded-xl border border-border bg-card p-3">
              {[
                { k: "WAPI-PRO7-X9K2-••••", p: "Pro", s: "Active" },
                { k: "WAPI-BUS3-4KD1-••••", p: "Business", s: "Active" },
                { k: "WAPI-STR9-2QW7-••••", p: "Starter", s: "Unused" },
              ].map((r) => (
                <div
                  key={r.k}
                  className="flex items-center justify-between border-b border-border/60 py-2 text-xs last:border-0"
                >
                  <span className="font-mono text-muted-foreground">{r.k}</span>
                  <span className="text-muted-foreground max-sm:hidden">{r.p}</span>
                  <span
                    className={`rounded-full px-2 py-0.5 text-[10px] ${
                      r.s === "Active" ? "bg-accent/15 text-accent" : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {r.s}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
