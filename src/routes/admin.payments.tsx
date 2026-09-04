import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { listPayments, reviewPayment } from "@/lib/admin.functions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";
import { Check, X } from "lucide-react";

export const Route = createFileRoute("/admin/payments")({
  head: () => ({ meta: [{ title: "Payments — Wapilot AI Admin" }, { name: "robots", content: "noindex" }] }),
  component: PaymentsPage,
});

function PaymentsPage() {
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({ queryKey: ["admin-payments"], queryFn: () => listPayments() });
  const reviewFn = useServerFn(reviewPayment);
  const refresh = () => {
    qc.invalidateQueries({ queryKey: ["admin-payments"] });
    qc.invalidateQueries({ queryKey: ["admin-licenses"] });
    qc.invalidateQueries({ queryKey: ["admin-overview"] });
  };

  async function act(id: number, action: "approve" | "reject") {
    try {
      await reviewFn({ data: { id, action } });
      toast.success(action === "approve" ? "Approve হয়েছে — license activate হয়েছে" : "Reject হয়েছে");
      refresh();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "ব্যর্থ হয়েছে");
    }
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Payments</h1>
      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            Pending: {(data ?? []).filter((p: any) => p.status === "pending").length} টি
          </CardTitle>
        </CardHeader>
        <CardContent className="overflow-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>তারিখ</TableHead>
                <TableHead>WhatsApp</TableHead>
                <TableHead>Sender</TableHead>
                <TableHead>TrxID</TableHead>
                <TableHead>Plan</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading && (
                <TableRow>
                  <TableCell colSpan={8} className="text-center text-muted-foreground">লোড হচ্ছে…</TableCell>
                </TableRow>
              )}
              {(data ?? []).map((p: any) => (
                <TableRow key={p.id}>
                  <TableCell className="text-xs">{new Date(p.created_at).toLocaleString()}</TableCell>
                  <TableCell className="font-mono text-xs">{p.wa_number}</TableCell>
                  <TableCell className="text-xs">
                    {p.sender_info || "—"}
                    {p.customer_name && <div className="text-muted-foreground">{p.customer_name}</div>}
                  </TableCell>
                  <TableCell className="font-mono text-xs">{p.trx_id}</TableCell>
                  <TableCell>
                    <Badge variant="secondary">{p.plan}</Badge>
                  </TableCell>
                  <TableCell>৳{p.amount || "—"}</TableCell>
                  <TableCell>
                    {p.status === "pending" ? (
                      <Badge variant="outline">pending</Badge>
                    ) : p.status === "approved" ? (
                      <Badge>approved</Badge>
                    ) : (
                      <Badge variant="destructive">rejected</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    {p.status === "pending" && (
                      <div className="flex justify-end gap-1">
                        <Button size="sm" onClick={() => act(p.id, "approve")}>
                          <Check className="mr-1 h-4 w-4" /> Approve
                        </Button>
                        <Button size="sm" variant="destructive" onClick={() => act(p.id, "reject")}>
                          <X className="mr-1 h-4 w-4" /> Reject
                        </Button>
                      </div>
                    )}
                  </TableCell>
                </TableRow>
              ))}
              {!isLoading && (data ?? []).length === 0 && (
                <TableRow>
                  <TableCell colSpan={8} className="text-center text-muted-foreground">
                    এখনো কোনো payment request নেই
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
