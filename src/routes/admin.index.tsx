import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { getOverview, getAnalytics } from "@/lib/admin.functions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, KeyRound, CreditCard, Coins, Activity, Timer } from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";

export const Route = createFileRoute("/admin/")({
  head: () => ({ meta: [{ title: "Overview — WaReply Pro Admin" }, { name: "robots", content: "noindex" }] }),
  component: AdminOverview,
});

function AdminOverview() {
  const overview = useQuery({ queryKey: ["admin-overview"], queryFn: () => getOverview() });
  const analytics = useQuery({ queryKey: ["admin-analytics"], queryFn: () => getAnalytics() });

  const o = overview.data;
  const stats = [
    { label: "মোট Licenses", value: o?.totalLicenses, icon: KeyRound },
    { label: "Active Paid", value: o?.activePaid, icon: Users },
    { label: "Active Trials", value: o?.activeTrials, icon: Timer },
    { label: "Pending Payments", value: o?.pendingPayments, icon: CreditCard },
    { label: "মোট Revenue (৳)", value: o?.totalRevenue?.toLocaleString(), icon: Coins },
    { label: "Events (30d)", value: o?.totalEvents, icon: Activity },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Overview</h1>
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
        {stats.map((s) => (
          <Card key={s.label}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{s.label}</CardTitle>
              <s.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{overview.isLoading ? "…" : (s.value ?? 0)}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">দৈনিক Activity (৩০ দিন)</CardTitle>
          </CardHeader>
          <CardContent className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={analytics.data?.daily ?? []}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey="date" fontSize={11} />
                <YAxis fontSize={11} allowDecimals={false} />
                <Tooltip />
                <Area type="monotone" dataKey="events" stroke="var(--color-primary)" fill="var(--color-primary)" fillOpacity={0.2} name="Events" />
                <Area type="monotone" dataKey="users" stroke="var(--color-chart-2)" fill="var(--color-chart-2)" fillOpacity={0.15} name="Active users" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">দৈনিক Revenue ৳ (৩০ দিন)</CardTitle>
          </CardHeader>
          <CardContent className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analytics.data?.daily ?? []}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey="date" fontSize={11} />
                <YAxis fontSize={11} allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="revenue" fill="var(--color-chart-2)" name="Revenue ৳" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {analytics.data && analytics.data.byType.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Event ধরন (৩০ দিন)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3">
              {analytics.data.byType.map((t) => (
                <div key={t.name} className="rounded-lg border border-border px-4 py-2 text-sm">
                  <span className="font-semibold">{t.value}</span>{" "}
                  <span className="text-muted-foreground">{t.name}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
