import { createMoment, createSource, deleteMoment, deleteSource, releaseMoment } from "@/app/actions/creator";
import { Empty, Flash } from "@/components/ui";
import { requireOwner } from "@/lib/auth";
import { db } from "@/lib/db";
import { dateFr, timecode } from "@/lib/format";
import { Submit } from "@/components/submit";

export default async function Page({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ erreur?: string; ok?: string }> }) {
  const { id } = await params;
  const sp = await searchParams;
  await requireOwner(id);
  const sources = await db.source.findMany({
    where: { workspaceId: id },
    include: { moments: { include: { reservedBy: { include: { user: true } }, clips: { select: { id: true } } }, orderBy: { startSec: "asc" } } },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <Flash sp={sp} />
      <div className="card">
        <h3 className="font-display text-lg font-bold">Ajouter une vidéo source</h3>
        <p className="mb-3 text-sm text-zinc-500">Live, podcast, démo produit, interview… Puis découpe les meilleurs moments : chaque clippeur en réserve un, personne ne publie le même clip.</p>
        <form action={createSource.bind(null, id)} className="grid gap-3 sm:grid-cols-[1fr_1fr_auto]">
          <input name="title" required placeholder="Titre (ex. Live lancement v2)" className="input" />
          <input name="url" required type="url" placeholder="Lien YouTube, Drive, Dropbox…" className="input" />
          <Submit className="btn">Ajouter</Submit>
          <input name="notes" placeholder="Consignes pour les clippeurs (optionnel)" className="input sm:col-span-3" />
        </form>
      </div>

      {sources.length === 0 && <Empty>Aucune source pour l&apos;instant.</Empty>}

      {sources.map((s) => (
        <div key={s.id} className="card">
          <div className="mb-3 flex flex-wrap items-start justify-between gap-2">
            <div>
              <h3 className="font-display text-lg font-bold">{s.title}</h3>
              <a href={s.url} target="_blank" rel="noreferrer" className="break-all text-sm text-brand-700 hover:underline">{s.url}</a>
              {s.notes && <p className="mt-1 text-sm text-zinc-600">{s.notes}</p>}
              <p className="text-xs text-zinc-400">Ajoutée le {dateFr(s.createdAt)}</p>
            </div>
            <form action={deleteSource.bind(null, id, s.id)}><Submit className="btn-danger">Supprimer</Submit></form>
          </div>

          {s.moments.length > 0 && (
            <table className="table mb-3">
              <thead><tr><th>Passage</th><th>Moment</th><th>Réservé par</th><th /></tr></thead>
              <tbody>
                {s.moments.map((m) => (
                  <tr key={m.id}>
                    <td className="font-mono text-xs">{timecode(m.startSec)} → {timecode(m.endSec)}</td>
                    <td>{m.title}{m.notes && <div className="text-xs text-zinc-500">{m.notes}</div>}</td>
                    <td>
                      {m.reservedBy ? (
                        <span>{m.reservedBy.user.name}{m.clips.length > 0 && <span className="ml-1 text-xs text-brand-700">· publié</span>}</span>
                      ) : (
                        <span className="text-zinc-400">Libre</span>
                      )}
                    </td>
                    <td className="whitespace-nowrap text-right">
                      {m.reservedBy && m.clips.length === 0 && (
                        <form action={releaseMoment.bind(null, id, m.id)} className="inline"><Submit className="btn-ghost mr-1">Libérer</Submit></form>
                      )}
                      {m.clips.length === 0 && (
                        <form action={deleteMoment.bind(null, id, m.id)} className="inline"><Submit className="btn-danger">×</Submit></form>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          <form action={createMoment.bind(null, id, s.id)} className="grid gap-2 sm:grid-cols-[110px_110px_1fr_auto]">
            <input name="start" required placeholder="Début 12:30" className="input" />
            <input name="end" required placeholder="Fin 13:15" className="input" />
            <input name="title" required placeholder="Le moment (ex. « Comment on a eu nos 100 premiers clients »)" className="input" />
            <Submit className="btn-ghost">+ Moment</Submit>
          </form>
        </div>
      ))}
    </div>
  );
}
