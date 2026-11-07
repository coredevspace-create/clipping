import { currentUser } from "@/lib/auth";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

const cell = (v: string | number) => {
  const s = String(v);
  // guillemets + neutralisation des formules (injection CSV dans Excel)
  return `"${(/^[=+\-@]/.test(s) ? `'${s}` : s).replace(/"/g, '""')}"`;
};

export async function GET(_req: Request, { params }: { params: Promise<{ id: string; runId: string }> }) {
  const { id, runId } = await params;
  const user = await currentUser();
  const run = await db.payoutRun.findFirst({
    where: { id: runId, workspaceId: id, workspace: { ownerId: user?.id ?? "-" } },
    include: { payouts: { include: { membership: { include: { user: true } } } } },
  });
  if (!user || !run) return new Response("Introuvable", { status: 404 });

  const rows = [
    ["Clippeur", "Email", "Méthode", "IBAN / PayPal", "Vues payées", "Montant (EUR)", "Statut", "Référence"],
    ...run.payouts.map((p) => [
      p.membership.user.name,
      p.membership.user.email,
      p.membership.payoutMethod ?? "",
      p.membership.payoutDetails ?? "",
      p.views,
      (p.amountCents / 100).toFixed(2).replace(".", ","),
      p.status === "PAID" ? "Payé" : "À payer",
      `CLIP-${run.id.slice(-6).toUpperCase()}`,
    ]),
  ];
  const csv = "﻿" + rows.map((r) => r.map(cell).join(";")).join("\r\n");
  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="paiements-${run.createdAt.toISOString().slice(0, 10)}.csv"`,
    },
  });
}
