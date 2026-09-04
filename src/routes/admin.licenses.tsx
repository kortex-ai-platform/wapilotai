import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { listLicenses, createLicense, updateLicense, deleteLicense } from "@/lib/admin.functions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";
import { useState } from "react";
import { Copy, Plus, Trash2 } from "lucide-react";

export const Route = createFileRoute("/admin/licenses")({
  head: () => ({ meta: [{ title: "Licenses — WaReply Pro Admin" }, { name: "robots", content: "noindex" }] }),
  component: LicensesPage,
});

function statusBadge(status: string, plan: string, expiresAt: string | null) {
  if (status !== "active") return <Badge variant="destructive">{status}</Badge>;
  if (plan !== "lifetime" && expiresAt && new Date(expiresAt) < new Date())
    return <Badge variant="destructive">expired</Badge>;
  return <Badge>{status}</Badge>;
}

function LicensesPage() {
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({ queryKey: ["admin-licenses"], queryFn: () => listLicenses() });
  const createFn = useServerFn(createLicense);
  const updateFn = useServerFn(updateLicense);
  const deleteFn = useServerFn(deleteLicense);

  const [open, setOpen] = useState(false);
  const [plan, setPlan] = useState<"monthly" | "yearly" | "lifetime">("monthly");
  const [userName, setUserName] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [search, setSearch] = useState("");

  const refresh = () => qc.invalidateQueries({ queryKey: ["admin-licenses"] });

  const filtered = (data ?? []).filter(
    (l: any) =>
      !search ||
      l.wa_number?.includes(search) ||
      l.license_key?.includes(search.toUpperCase()) ||
      l.user_name?.toLowerCase().includes(search.toLowerCase()) ||
      l.business_name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold">Licenses</h1>
        <div className="flex gap-2">
          <Input placeholder="নম্বর / key / নাম খুঁজুন…" value={search} onChange={(e) => setSearch(e.target.value)} className="w-56" />
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-1 h-4 w-4" /> নতুন License Key
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>নতুন license key তৈরি করুন</DialogTitle>
              </DialogHeader>
              <div className="space-y-3">
                <div className="space-y-1">
                  <Label>Plan</Label>
                  <Select value={plan} onValueChange={(v) => setPlan(v as typeof plan)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="monthly">Monthly (৩০ দিন)</SelectItem>
                      <SelectItem value="yearly">Yearly (৩৬৫ দিন)</SelectItem>
                      <SelectItem value="lifetime">Lifetime</SelectItem>
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
                      const res = await createFn({ data: { plan, userName: userName || undefined, businessName: businessName || undefined } });
                      toast.success(`Key তৈরি হয়েছে: ${res.key}`);
                      await navigator.clipboard.writeText(res.key).catch(() => {});
                      setOpen(false);
                      refresh();
                    } catch (e) {
                      toast.error(e instanceof Error ? e.message : "ব্যর্থ হয়েছে");
                    }
                  }}
                >
                  তৈরি করুন ও কপি করুন
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">{filtered.length} টি license</CardTitle>
        </CardHeader>
        <CardContent className="overflow-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>WhatsApp</TableHead>
                <TableHead>Key</TableHead>
                <TableHead>Plan</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>কাস্টমার</TableHead>
                <TableHead>Expiry</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-muted-foreground">লোড হচ্ছে…</TableCell>
                </TableRow>
              )}
              {filtered.map((l: any) => (
                <TableRow key={l.id}>
                  <TableCell className="font-mono text-xs">{l.wa_number}</TableCell>
                  <TableCell>
                    {l.license_key ? (
                      <button
                        className="flex items-center gap-1 font-mono text-xs hover:text-primary"
                        onClick={() => {
                          navigator.clipboard.writeText(l.license_key);
                          toast.success("কপি হয়েছে");
                        }}
                      >
                        {l.license_key} <Copy className="h-3 w-3" />
                      </button>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">{l.plan}</Badge>
                  </TableCell>
                  <TableCell>{statusBadge(l.status, l.plan, l.expires_at)}</TableCell>
                  <TableCell className="text-xs">
                    {l.user_name || "—"}
                    {l.business_name && <div className="text-muted-foreground">{l.business_name}</div>}
                  </TableCell>
                  <TableCell className="text-xs">
                    {l.plan === "lifetime" ? "আজীবন" : l.expires_at ? new Date(l.expires_at).toLocaleDateString() : "—"}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      {l.status !== "active" ? (
                        <Button size="sm" variant="outline" onClick={() => updateFn({ data: { id: l.id, status: "active" } }).then(refresh)}>
                          Enable
                        </Button>
                      ) : (
                        <Button size="sm" variant="outline" onClick={() => updateFn({ data: { id: l.id, status: "disabled" } }).then(refresh)}>
                          Disable
                        </Button>
                      )}
                      {l.plan !== "lifetime" && (
                        <Button size="sm" variant="outline" onClick={() => updateFn({ data: { id: l.id, extendDays: 30 } }).then(refresh)}>
                          +৩০দিন
                        </Button>
                      )}
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
    </div>
  );
}
