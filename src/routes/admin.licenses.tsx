import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import {
  listLicenses,
  createLicense,
  updateLicense,
  deleteLicense,
  listDevices,
  removeDevice,
} from "@/lib/admin.functions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { useState } from "react";
import { Copy, Laptop, Plus, RotateCcw, Trash2 } from "lucide-react";
import { PLANS, planLabel } from "@/lib/license-utils";

export const Route = createFileRoute("/admin/licenses")({
  head: () => ({ meta: [{ title: "Licenses — Wapilot AI Admin" }, { name: "robots", content: "noindex" }] }),
  component: LicensesPage,
});

const DURATIONS = [
  { label: "7 Days", value: 7 },
  { label: "30 Days", value: 30 },
  { label: "90 Days", value: 90 },
  { label: "365 Days", value: 365 },
];

const STATUS_TABS = ["all", "active", "inactive", "expired", "suspended", "revoked", "blocked"] as const;

function statusBadge(status: string) {
  const variant =
    status === "active" ? "default" : status === "inactive" ? "secondary" : ("destructive" as const);
  return <Badge variant={variant as any}>{status}</Badge>;
}

function LicensesPage() {
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({ queryKey: ["admin-licenses"], queryFn: () => listLicenses() });
  const createFn = useServerFn(createLicense);
  const updateFn = useServerFn(updateLicense);
  const deleteFn = useServerFn(deleteLicense);
  const devicesFn = useServerFn(listDevices);
  const removeDeviceFn = useServerFn(removeDevice);

  const [open, setOpen] = useState(false);
  const [plan, setPlan] = useState<(typeof PLANS)[number]>("pro");
  const [duration, setDuration] = useState(30);
  const [maxDevices, setMaxDevices] = useState(1);
  const [userName, setUserName] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [search, setSearch] = useState("");
  const [tab, setTab] = useState<string>("all");
  const [newKey, setNewKey] = useState<string | null>(null);
  const [deviceLicense, setDeviceLicense] = useState<any | null>(null);
  const [devices, setDevices] = useState<any[]>([]);

  const refresh = () => qc.invalidateQueries({ queryKey: ["admin-licenses"] });

  const filtered = (data ?? []).filter((l: any) => {
    const matchesTab = tab === "all" || l.status === tab;
    const q = search.toLowerCase();
    const matchesSearch =
      !search ||
      l.wa_number?.includes(search) ||
      l.key_prefix?.toLowerCase().includes(q) ||
      l.user_name?.toLowerCase().includes(q) ||
      l.business_name?.toLowerCase().includes(q);
    return matchesTab && matchesSearch;
  });

  const openDevices = async (lic: any) => {
    setDeviceLicense(lic);
    setDevices(await devicesFn({ data: { licenseId: lic.id } }));
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold">Licenses</h1>
        <div className="flex gap-2">
          <Input
            placeholder="নম্বর / prefix / নাম খুঁজুন…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-56"
          />
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-1 h-4 w-4" /> Generate License
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>নতুন Wapilot AI license</DialogTitle>
              </DialogHeader>
              <div className="space-y-3">
                <div className="space-y-1">
                  <Label>Plan</Label>
                  <Select value={plan} onValueChange={(v) => setPlan(v as typeof plan)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {PLANS.map((p) => (
                        <SelectItem key={p} value={p}>
                          {planLabel(p)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                {plan !== "lifetime" && (
                  <div className="space-y-1">
                    <Label>Duration</Label>
                    <Select value={String(duration)} onValueChange={(v) => setDuration(Number(v))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {DURATIONS.map((d) => (
                          <SelectItem key={d.value} value={String(d.value)}>
                            {d.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
                <div className="space-y-1">
                  <Label>Max Devices</Label>
                  <Select value={String(maxDevices)} onValueChange={(v) => setMaxDevices(Number(v))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {[1, 2, 5, 10].map((n) => (
                        <SelectItem key={n} value={String(n)}>
                          {n}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <Label>কাস্টমারের নাম (ঐচ্ছিক)</Label>
                  <Input value={userName} onChange={(e) => setUserName(e.target.value)} />
                </div>
                <div className="space-y-1">
                  <Label>ব্যবসার নাম (ঐচ্ছিক)</Label>
                  <Input value={businessName} onChange={(e) => setBusinessName(e.target.value)} />
                </div>
                <Button
                  className="w-full"
                  onClick={async () => {
                    try {
                      const res = await createFn({
                        data: {
                          plan,
                          durationDays: plan === "lifetime" ? null : duration,
                          maxDevices,
                          userName: userName || undefined,
                          businessName: businessName || undefined,
                        },
                      });
                      setNewKey(res.key);
                      await navigator.clipboard.writeText(res.key).catch(() => {});
                      setOpen(false);
                      refresh();
                    } catch (e) {
                      toast.error(e instanceof Error ? e.message : "ব্যর্থ হয়েছে");
                    }
                  }}
                >
                  Generate License
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Dialog open={!!newKey} onOpenChange={() => setNewKey(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>License key তৈরি হয়েছে</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Key শুধু এখনই দেখা যাবে — সার্ভারে শুধু hash সংরক্ষিত থাকে। কপি করে কাস্টমারকে দিন।
          </p>
          <div className="flex items-center gap-2 rounded-lg border border-border bg-secondary p-3 font-mono text-sm">
            {newKey}
            <Button
              size="sm"
              variant="ghost"
              onClick={() => {
                navigator.clipboard.writeText(newKey ?? "");
                toast.success("কপি হয়েছে");
              }}
            >
              <Copy className="h-4 w-4" />
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="flex-wrap">
          {STATUS_TABS.map((s) => (
            <TabsTrigger key={s} value={s} className="capitalize">
              {s}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">{filtered.length} টি license</CardTitle>
        </CardHeader>
        <CardContent className="overflow-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Key</TableHead>
                <TableHead>Plan</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Devices</TableHead>
                <TableHead>কাস্টমার</TableHead>
                <TableHead>Expiry</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-muted-foreground">
                    লোড হচ্ছে…
                  </TableCell>
                </TableRow>
              )}
              {filtered.map((l: any) => (
                <TableRow key={l.id}>
                  <TableCell className="font-mono text-xs">
                    {l.key_prefix ? `${l.key_prefix}-••••-••••` : l.license_key || "—"}
                    {l.wa_number && <div className="text-muted-foreground">{l.wa_number}</div>}
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">{planLabel(l.plan)}</Badge>
                  </TableCell>
                  <TableCell>{statusBadge(l.status)}</TableCell>
                  <TableCell className="text-xs">
                    {l.current_devices ?? 0}/{l.max_devices ?? 1}
                  </TableCell>
                  <TableCell className="text-xs">
                    {l.user_name || l.app_users?.name || "—"}
                    {(l.business_name || l.app_users?.email) && (
                      <div className="text-muted-foreground">{l.business_name || l.app_users?.email}</div>
                    )}
                  </TableCell>
                  <TableCell className="text-xs">
                    {l.plan === "lifetime"
                      ? "আজীবন"
                      : l.expires_at
                        ? new Date(l.expires_at).toLocaleDateString()
                        : `${l.duration_days ?? "—"} দিন (unused)`}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex flex-wrap justify-end gap-1">
                      <Button size="sm" variant="outline" onClick={() => openDevices(l)}>
                        <Laptop className="h-4 w-4" />
                      </Button>
                      <Select
                        value={l.status}
                        onValueChange={(v) => updateFn({ data: { id: l.id, status: v as any } }).then(refresh)}
                      >
                        <SelectTrigger className="h-8 w-28 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {["active", "inactive", "suspended", "revoked", "blocked", "expired"].map((s) => (
                            <SelectItem key={s} value={s} className="capitalize">
                              {s}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {l.plan !== "lifetime" && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => updateFn({ data: { id: l.id, extendDays: 30 } }).then(refresh)}
                        >
                          +৩০দিন
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="outline"
                        title="Reset devices"
                        onClick={() => updateFn({ data: { id: l.id, resetDevices: true } }).then(refresh)}
                      >
                        <RotateCcw className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={async () => {
                          if (confirm("মুছে ফেলবেন?")) {
                            await deleteFn({ data: { id: l.id } });
                            refresh();
                          }
                        }}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={!!deviceLicense} onOpenChange={() => setDeviceLicense(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Activated devices</DialogTitle>
          </DialogHeader>
          {devices.length === 0 && <p className="text-sm text-muted-foreground">কোনো device activate হয়নি।</p>}
          <div className="space-y-2">
            {devices.map((d) => (
              <div key={d.id} className="flex items-center justify-between rounded-lg border border-border p-3">
                <div className="text-xs">
                  <p className="font-mono">{d.device_id}</p>
                  <p className="text-muted-foreground">
                    {d.label || d.wa_number || "—"} · last seen {new Date(d.last_seen).toLocaleString()}
                  </p>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={async () => {
                    await removeDeviceFn({ data: { id: d.id, licenseId: deviceLicense.id } });
                    setDevices(devices.filter((x) => x.id !== d.id));
                    refresh();
                  }}
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
