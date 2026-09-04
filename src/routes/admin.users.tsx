import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { listUsers, upsertUser, setUserStatus, deleteUser } from "@/lib/admin.functions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { USER_STATUSES, planLabel } from "@/lib/license-utils";

export const Route = createFileRoute("/admin/users")({
  head: () => ({ meta: [{ title: "Users — Wapilot AI Admin" }, { name: "robots", content: "noindex" }] }),
  component: UsersPage,
});

const emptyForm = { id: undefined as string | undefined, name: "", email: "", phone: "", notes: "" };

function UsersPage() {
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({ queryKey: ["admin-users"], queryFn: () => listUsers() });
  const saveFn = useServerFn(upsertUser);
  const statusFn = useServerFn(setUserStatus);
  const deleteFn = useServerFn(deleteUser);

  const [tab, setTab] = useState("all");
  const [search, setSearch] = useState("");
  const [form, setForm] = useState<typeof emptyForm | null>(null);

  const refresh = () => qc.invalidateQueries({ queryKey: ["admin-users"] });

  const filtered = (data ?? []).filter((u: any) => {
    const q = search.toLowerCase();
    return (
      (tab === "all" || u.status === tab) &&
      (!search ||
        u.name?.toLowerCase().includes(q) ||
        u.email?.toLowerCase().includes(q) ||
        u.phone?.includes(search))
    );
  });

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold">Users</h1>
        <div className="flex gap-2">
          <Input
            placeholder="নাম / email / phone…"
            className="w-56"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <Button onClick={() => setForm({ ...emptyForm })}>
            <Plus className="mr-1 h-4 w-4" /> Add user
          </Button>
        </div>
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          {["all", ...USER_STATUSES].map((s) => (
            <TabsTrigger key={s} value={s} className="capitalize">
              {s}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">{filtered.length} জন user</CardTitle>
        </CardHeader>
        <CardContent className="overflow-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Plan / License</TableHead>
                <TableHead>Devices</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
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
              {filtered.map((u: any) => {
                const lic = (u.licenses ?? [])[0];
                return (
                  <TableRow key={u.id}>
                    <TableCell className="font-medium">{u.name || "—"}</TableCell>
                    <TableCell className="text-xs">
                      {u.email || "—"}
                      <div className="text-muted-foreground">{u.phone || ""}</div>
                    </TableCell>
                    <TableCell className="text-xs">
                      {lic ? (
                        <>
                          <Badge variant="secondary">{planLabel(lic.plan)}</Badge>
                          <div className="font-mono text-muted-foreground">{lic.key_prefix}</div>
                        </>
                      ) : (
                        "—"
                      )}
                    </TableCell>
                    <TableCell className="text-xs">
                      {lic ? `${lic.current_devices ?? 0}/${lic.max_devices ?? 1}` : "—"}
                    </TableCell>
                    <TableCell>
                      <Select value={u.status} onValueChange={(v) => statusFn({ data: { id: u.id, status: v as any } }).then(refresh)}>
                        <SelectTrigger className="h-8 w-32 text-xs capitalize">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {USER_STATUSES.map((s) => (
                            <SelectItem key={s} value={s} className="capitalize">
                              {s}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell className="text-xs">{new Date(u.created_at).toLocaleDateString()}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() =>
                            setForm({
                              id: u.id,
                              name: u.name ?? "",
                              email: u.email ?? "",
                              phone: u.phone ?? "",
                              notes: u.notes ?? "",
                            })
                          }
                        >
                          Edit
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={async () => {
                            if (confirm("মুছে ফেলবেন?")) {
                              await deleteFn({ data: { id: u.id } });
                              refresh();
                            }
                          }}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={!!form} onOpenChange={() => setForm(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{form?.id ? "User edit" : "নতুন user"}</DialogTitle>
          </DialogHeader>
          {form && (
            <div className="space-y-3">
              <div className="space-y-1">
                <Label>Name</Label>
                <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              </div>
              <div className="space-y-1">
                <Label>Email</Label>
                <Input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
              </div>
              <div className="space-y-1">
                <Label>Phone</Label>
                <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
              </div>
              <div className="space-y-1">
                <Label>Notes</Label>
                <Textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
              </div>
              <Button
                className="w-full"
                onClick={async () => {
                  try {
                    await saveFn({ data: { ...form, email: form.email || undefined } });
                    toast.success("সংরক্ষিত হয়েছে");
                    setForm(null);
                    refresh();
                  } catch (e) {
                    toast.error(e instanceof Error ? e.message : "ব্যর্থ হয়েছে");
                  }
                }}
              >
                Save
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
