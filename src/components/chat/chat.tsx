"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { canPost, CHANNELS, type ChannelKey, type ChatMessage, MAX_MESSAGE } from "@/lib/chat-shared";

type Props = {
  workspaceId: string;
  workspaceName: string;
  me: { id: string; isOwner: boolean };
  initialChannel: ChannelKey;
  initialMessages: ChatMessage[];
  members: { id: string; name: string; isOwner: boolean }[];
};

const POLL_VISIBLE = 5000;

export function Chat({ workspaceId, workspaceName, me, initialChannel, initialMessages, members }: Props) {
  const [channel, setChannel] = useState<ChannelKey>(initialChannel);
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [unread, setUnread] = useState<Partial<Record<ChannelKey, boolean>>>({});
  const listRef = useRef<HTMLDivElement>(null);
  const stick = useRef(true);
  const lastSeen = useRef<Partial<Record<ChannelKey, string>>>({});
  const api = `/api/e/${workspaceId}/chat`;
  const writable = canPost(channel, me.isOwner);

  const fetchChannel = useCallback(
    async (c: ChannelKey) => {
      const r = await fetch(`${api}?channel=${c}`, { cache: "no-store" });
      if (!r.ok) throw new Error((await r.json().catch(() => ({}))).error ?? "Erreur réseau");
      const data = (await r.json()) as { messages: ChatMessage[]; latest: Partial<Record<ChannelKey, string>> };
      // nouveaux messages dans les autres salons → pastille
      for (const ch of CHANNELS) {
        const l = data.latest[ch.key];
        if (!l || ch.key === c) {
          if (l) lastSeen.current[ch.key] = l;
          continue;
        }
        const [, author] = l.split(":");
        if (lastSeen.current[ch.key] !== undefined && lastSeen.current[ch.key] !== l && author !== me.id) setUnread((u) => ({ ...u, [ch.key]: true }));
        lastSeen.current[ch.key] = l;
      }
      return data.messages;
    },
    [api, me.id],
  );

  // changement de salon
  const switchTo = async (c: ChannelKey) => {
    if (c === channel) return;
    setChannel(c);
    setLoading(true);
    setUnread((u) => ({ ...u, [c]: false }));
    stick.current = true;
    const url = new URL(location.href);
    url.searchParams.set("salon", c);
    history.replaceState(null, "", url);
    try {
      setMessages(await fetchChannel(c));
      setError(null);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  };

  // rafraîchissement régulier (plus lent quand l'onglet est en arrière-plan)
  useEffect(() => {
    let stopped = false;
    let t: ReturnType<typeof setTimeout>;
    const tick = async () => {
      try {
        const fresh = await fetchChannel(channel);
        if (!stopped) setMessages((old) => (sameList(old, fresh) ? old : fresh));
      } catch {
        /* réseau : on réessaie au prochain tour */
      }
      // onglet en arrière-plan : on arrête complètement, on reprend au retour
      if (!stopped && !document.hidden) t = setTimeout(tick, POLL_VISIBLE);
    };
    t = setTimeout(tick, POLL_VISIBLE);
    const onVisible = () => {
      clearTimeout(t);
      if (!document.hidden) tick();
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      stopped = true;
      clearTimeout(t);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [channel, fetchChannel]);

  // défilement automatique vers le bas, sauf si l'utilisateur relit l'historique
  useLayoutEffect(() => {
    const el = listRef.current;
    if (el && stick.current) el.scrollTop = el.scrollHeight;
  }, [messages, channel]);

  const send = async () => {
    const body = draft.trim();
    if (!body || sending) return;
    setSending(true);
    setError(null);
    const temp: ChatMessage = { id: `tmp-${Date.now()}`, body, createdAt: new Date().toISOString(), userId: me.id, name: "Moi", isOwner: me.isOwner };
    stick.current = true;
    setMessages((m) => [...m, temp]);
    setDraft("");
    try {
      const r = await fetch(api, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ channel, body }) });
      const data = await r.json();
      if (!r.ok) throw new Error(data.error ?? "Envoi impossible");
      setMessages((m) => m.map((x) => (x.id === temp.id ? data.message : x)));
    } catch (e) {
      setMessages((m) => m.filter((x) => x.id !== temp.id));
      setDraft(body);
      setError((e as Error).message);
    } finally {
      setSending(false);
    }
  };

  const remove = async (id: string) => {
    if (!confirm("Supprimer ce message ?")) return;
    const before = messages;
    setMessages((m) => m.filter((x) => x.id !== id));
    const r = await fetch(`${api}?messageId=${id}`, { method: "DELETE" });
    if (!r.ok) {
      setMessages(before);
      setError("Suppression impossible.");
    }
  };

  const current = CHANNELS.find((c) => c.key === channel)!;

  return (
    <div className="grid h-[calc(100dvh-18rem)] min-h-[480px] overflow-hidden rounded-[20px] bg-white md:grid-cols-[230px_1fr]">
      {/* salons */}
      <aside className="flex gap-1 overflow-x-auto border-b border-zinc-200 bg-[#f5f5f7] p-2 text-ink md:flex-col md:border-b-0 md:border-r md:p-3">
        <div className="hidden truncate px-2 pb-2 pt-1 text-[11px] font-semibold uppercase tracking-wide text-zinc-500 md:block">{workspaceName}</div>
        {CHANNELS.map((c) => (
          <button
            key={c.key}
            onClick={() => switchTo(c.key)}
            className={`flex shrink-0 items-center justify-between gap-2 rounded-xl px-3 py-2 text-left text-sm transition ${c.key === channel ? "bg-white font-medium text-ink shadow-[0_1px_2px_rgba(0,0,0,0.06)]" : "text-zinc-600 hover:bg-black/[0.04] hover:text-ink"}`}
          >
            <span><span className="text-zinc-400">#</span> {c.label}</span>
            {c.ownerOnly && <span className="text-[10px] text-zinc-400">🔒</span>}
            {unread[c.key] && <span className="h-2 w-2 rounded-full bg-accent" aria-label="Nouveaux messages" />}
          </button>
        ))}
        <div className="mt-auto hidden px-2 pt-4 md:block">
          <div className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-zinc-500">Membres · {members.length}</div>
          <ul className="max-h-48 space-y-1 overflow-y-auto text-sm">
            {members.map((m) => (
              <li key={m.id} className="flex items-center gap-2 text-zinc-700">
                <span className="h-1.5 w-1.5 rounded-full bg-lime" />
                <span className="truncate">{m.name}</span>
                {m.isOwner && <span className="rounded-full bg-brand-100 px-1.5 text-[10px] font-semibold text-brand-700">Créateur</span>}
              </li>
            ))}
          </ul>
        </div>
      </aside>

      {/* fil */}
      <section className="flex min-h-0 flex-col">
        <header className="flex items-center justify-between gap-3 border-b border-zinc-200 px-5 py-3">
          <div>
            <div className="text-[17px] font-semibold"><span className="text-zinc-400">#</span> {current.label}</div>
            <div className="text-xs text-zinc-500">{current.desc}</div>
          </div>
          {loading && <span className="h-4 w-4 animate-spin rounded-full border-2 border-ink border-r-transparent" aria-label="Chargement" />}
        </header>

        <div
          ref={listRef}
          onScroll={(e) => {
            const el = e.currentTarget;
            stick.current = el.scrollHeight - el.scrollTop - el.clientHeight < 80;
          }}
          className="min-h-0 flex-1 overflow-y-auto px-5 py-4"
        >
          {messages.length === 0 && !loading ? (
            <div className="grid h-full place-items-center text-center text-sm text-zinc-500">
              <div>
                <div className="text-2xl font-semibold tracking-tight text-ink">Bienvenue dans #{current.label}</div>
                <p className="mt-1">{writable ? "Lance la discussion !" : "Le créateur publiera ses consignes ici."}</p>
              </div>
            </div>
          ) : (
            <ol className="space-y-0.5">
              {messages.map((m, i) => {
                const prev = messages[i - 1];
                const newDay = !prev || day(prev.createdAt) !== day(m.createdAt);
                const grouped = !newDay && prev && prev.userId === m.userId && +new Date(m.createdAt) - +new Date(prev.createdAt) < 5 * 60_000;
                const mine = m.userId === me.id;
                return (
                  <li key={m.id}>
                    {newDay && (
                      <div className="my-4 flex items-center gap-3 text-xs text-zinc-400">
                        <span className="h-px flex-1 bg-ink/10" />
                        <span className="font-medium">{day(m.createdAt)}</span>
                        <span className="h-px flex-1 bg-ink/10" />
                      </div>
                    )}
                    <div className={`group relative flex gap-3 rounded-xl px-2 py-1 hover:bg-[#f5f5f7] ${m.id.startsWith("tmp-") ? "opacity-60" : ""}`}>
                      <div className="w-9 shrink-0">
                        {!grouped && (
                          <span className={`grid h-9 w-9 place-items-center rounded-full text-sm font-semibold ${m.isOwner ? "bg-accent text-white" : "bg-gradient-to-b from-[#a1a1a6] to-[#8e8e93] text-white"}`}>
                            {initials(m.name)}
                          </span>
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        {!grouped && (
                          <div className="flex items-baseline gap-2">
                            <span className="font-semibold">{mine ? "Toi" : m.name}</span>
                            {m.isOwner && <span className="rounded-full bg-brand-100 px-2 py-0.5 text-[10px] font-semibold text-brand-700">Créateur</span>}
                            <span className="text-[12px] text-zinc-400">{time(m.createdAt)}</span>
                          </div>
                        )}
                        <p className="whitespace-pre-wrap break-words text-[15px] leading-relaxed text-zinc-800">{linkify(m.body)}</p>
                      </div>
                      {(mine || me.isOwner) && !m.id.startsWith("tmp-") && (
                        <button
                          onClick={() => remove(m.id)}
                          className="absolute right-2 top-1 hidden rounded-lg bg-white px-2 py-0.5 text-xs text-zinc-500 hover:text-coral group-hover:block"
                        >
                          Supprimer
                        </button>
                      )}
                    </div>
                  </li>
                );
              })}
            </ol>
          )}
        </div>

        <div className="border-t border-zinc-200 p-3">
          {error && <div className="mb-2 rounded-xl bg-coral/10 px-3 py-2 text-sm text-coral">{error}</div>}
          {writable ? (
            <form
              data-no-progress
              onSubmit={(e) => {
                e.preventDefault();
                send();
              }}
              className="flex items-end gap-2"
            >
              <textarea
                value={draft}
                onChange={(e) => setDraft(e.target.value.slice(0, MAX_MESSAGE))}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    send();
                  }
                }}
                rows={1}
                placeholder={`Écrire dans #${current.label}…`}
                title="Entrée pour envoyer, Maj+Entrée pour aller à la ligne"
                className="input max-h-40 min-h-[44px] flex-1 resize-none"
              />
              <button type="submit" disabled={!draft.trim() || sending} className="btn h-11 shrink-0">
                {sending ? <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-r-transparent" /> : "Envoyer"}
              </button>
            </form>
          ) : (
            <p className="rounded-xl bg-paper px-3 py-2.5 text-center text-sm text-zinc-500">🔒 Seul le créateur peut écrire dans #{current.label}.</p>
          )}
        </div>
      </section>
    </div>
  );
}

const sameList = (a: ChatMessage[], b: ChatMessage[]) => a.length === b.length && a.every((m, i) => m.id === b[i].id);
const initials = (n: string) => (n.match(/\p{L}+/gu) ?? ["?"]).map((w) => w[0]).join("").slice(0, 2).toUpperCase();
const day = (iso: string) => new Date(iso).toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" });
const time = (iso: string) => new Date(iso).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });

/** Rend les liens cliquables (pratique pour partager des clips). */
function linkify(text: string) {
  const parts = text.split(/(https?:\/\/[^\s<]+)/g);
  return parts.map((p, i) =>
    /^https?:\/\//.test(p) ? (
      <a key={i} href={p} target="_blank" rel="noreferrer nofollow" className="break-all font-medium text-brand-700 hover:underline">
        {p}
      </a>
    ) : (
      p
    ),
  );
}
