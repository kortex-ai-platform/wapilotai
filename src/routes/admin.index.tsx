import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { getOverview, getAnalytics } from "@/lib/admin.functions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Activity, CreditCard, KeyRound, Laptop, Users, Wallet } from "lucide-react";

export const Route = createFileRoute("/admin/")({
  head: () => ({
    meta: [{ title: "Overview — Wapilot AI Admin" }, { name: "robots", content: "noindex" }],
  }),
  component: OverviewPage,
});

function Metric({ label, value, icon: Icon }: { label: string; value: string | number; icon: any }) {
  return (
    <Card className="border-border/70">
      <CardContent className="flex items-center gap-4 p-5">
        <div className="rounded-xl bg-primary/10 p-3 text-primary">
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className="text-2xl font-bold">{value}</p>
        </div>
      </CardContent>
    </Card>
  );
}

function OverviewPage() {
  const { data: o } = useQuery({ queryKey: ["admin-overview"], queryFn: () => getOverview() });
  const { data: a } = useQuery({ queryKey: ["admin-analytics"], queryFn: () => getAnalytics() });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Overview</h1>
        <p className="text-sm text-muted-foreground">Wapilot AI — WhatsApp Business Automation</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Metric label="Active licenses" value={o?.activeLicenses ?? "—"} icon={KeyRound} />
        <Metric label="Unused licenses" value={o?.unusedLicenses ?? "—"} icon={KeyRound} />
        <Metric label="Total users" value={o?.totalUsers ?? "—"} icon={Users} />
        <Metric label="Active devices" value={o?.totalDevices ?? "—"} icon={Laptop} />
        <Metric label="Pending payments" value={o?.pendingPayments ?? "—"} icon={CreditCard} />
        <Metric label="Revenue (BDT)" value={o ? o.totalRevenue.toLocaleString() : "—"} icon={Wallet} />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Activity — last 30 days</CardTitle>
          </CardHeader>
          <CardContent className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={a?.daily ?? []}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="date" fontSize={11} stroke="var(--muted-foreground)" />
                <YAxis fontSize={11} stroke="var(--muted-foreground)" />
                <Tooltip
                  contentStyle={{ background: "var(--popover)", border: "1px solid var(--border)", borderRadius: 8 }}
                />
                <Area type="monotone" dataKey="events" stroke="var(--chart-1)" fill="var(--chart-1)" fillOpacity={0.2} />
                <Area type="monotone" dataKey="users" stroke="var(--chart-2)" fill="var(--chart-2)" fillOpacity={0.15} />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Event types</CardTitle>
          </CardHeader>
          <CardContent className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={a?.byType ?? []}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="type" fontSize={11} stroke="var(--muted-foreground)" />
                <YAxis fontSize={11} stroke="var(--muted-foreground)" />
                <Tooltip
                  contentStyle={{ background: "var(--popover)", border: "1px solid var(--border)", borderRadius: 8 }}
                />
                <Bar dataKey="count" fill="var(--chart-1)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Activity className="h-4 w-4" /> Total events (30 days): {o?.totalEvents ?? "—"}
          </CardTitle>
        </CardHeader>
      </Card>
    </div>
  );
}
