import { createHmac } from "node:crypto";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { decrypt, encrypt } from "@/lib/crypto";
import { analyzeClip } from "@/lib/fraud";
import { parseSignedRequest } from "@/lib/oauth/meta";
import { PROVIDERS } from "@/lib/oauth/providers";
import { signState, verifyState } from "@/lib/oauth/state";
import { audienceShare } from "@/lib/views/audience";
import { instagramProvider } from "@/lib/views/instagram";
import { tiktokProvider } from "@/lib/views/tiktok";
import { youtubeProvider } from "@/lib/views/youtube";

const ctx = { submittedAt: new Date(), now: new Date() };
const ok = (body: unknown) => new Response(JSON.stringify(body), { status: 200, headers: { "Content-Type": "application/json" } });
let fetchMock: ReturnType<typeof vi.fn>;

beforeEach(() => {
  process.env.AUTH_SECRET = "secret-de-test-assez-long";
  fetchMock = vi.fn();
  vi.stubGlobal("fetch", fetchMock);
});
afterEach(() => {
  vi.unstubAllGlobals();
  delete process.env.YOUTUBE_API_KEY;
});

describe("chiffrement des jetons", () => {
  it("chiffre et déchiffre", () => {
    const c = encrypt("jeton-secret");
    expect(c).not.toContain("jeton-secret");
    expect(decrypt(c)).toBe("jeton-secret");
  });
  it("refuse un jeton modifié", () => {
    const c = encrypt("jeton-secret").split(".");
    c[3] = Buffer.from("autre").toString("base64url");
    expect(() => decrypt(c.join("."))).toThrow();
  });
});

describe("state OAuth", () => {
  it("signe et vérifie", async () => {
    const s = await signState({ uid: "u1", platform: "TIKTOK", nonce: "n", back: "/app/comptes" });
    expect(await verifyState(s)).toMatchObject({ uid: "u1", platform: "TIKTOK" });
  });
  it("refuse un state falsifié", async () => {
    const s = await signState({ uid: "u1", platform: "TIKTOK", nonce: "n", back: "/" });
    await expect(verifyState(s.slice(0, -2) + "xx")).rejects.toThrow();
  });
});

describe("TikTok", () => {
  const account = { accessToken: "tok", externalUserId: "open-1" };
  it("lit les stats d'une vidéo du compte connecté", async () => {
    fetchMock.mockResolvedValueOnce(ok({ data: { videos: [{ id: "123", view_count: 5000, like_count: 300, comment_count: 12, share_count: 8, create_time: 1700000000 }] }, error: { code: "ok" } }));
    const r = await tiktokProvider({ ...ctx, platform: "TIKTOK", externalId: "123", account });
    expect(r).toMatchObject({ ownershipVerified: true, stats: { views: 5000, likes: 300, shares: 8, source: "API" } });
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toContain("/v2/video/query/");
    expect(JSON.parse(init.body)).toEqual({ filters: { video_ids: ["123"] } });
    expect(init.headers.Authorization).toBe("Bearer tok");
  });
  it("signale une vidéo absente du compte", async () => {
    fetchMock.mockResolvedValueOnce(ok({ data: { videos: [] }, error: { code: "ok" } }));
    const r = await tiktokProvider({ ...ctx, platform: "TIKTOK", externalId: "999", account });
    expect(r).toEqual({ stats: null, ownershipVerified: false, audienceShare: null });
  });
  it("sans compte connecté : non interrogeable", async () => {
    expect(await tiktokProvider({ ...ctx, platform: "TIKTOK", externalId: "1", account: null })).toBeNull();
  });
  it("remonte les erreurs de l'API", async () => {
    fetchMock.mockResolvedValueOnce(ok({ data: {}, error: { code: "access_token_invalid", message: "expired" } }));
    await expect(tiktokProvider({ ...ctx, platform: "TIKTOK", externalId: "1", account })).rejects.toThrow("expired");
  });
});

describe("Instagram", () => {
  const account = { accessToken: "ig", externalUserId: "17841" };
  it("retrouve le Reel sur la 2e page puis lit ses statistiques", async () => {
    fetchMock
      .mockResolvedValueOnce(ok({ data: [{ id: "m1", shortcode: "AAA" }], paging: { next: "https://graph.instagram.com/next" } }))
      .mockResolvedValueOnce(ok({ data: [{ id: "m2", shortcode: "C1a2B3", timestamp: "2026-11-01T10:00:00+0000" }] }))
      .mockResolvedValueOnce(ok({ data: [
        { name: "views", values: [{ value: 8000 }] },
        { name: "likes", values: [{ value: 400 }] },
        { name: "comments", total_value: { value: 20 } },
        { name: "shares", values: [{ value: 15 }] },
      ] }));
    const r = await instagramProvider({ ...ctx, platform: "INSTAGRAM", externalId: "C1a2B3", account });
    expect(r).toMatchObject({ ownershipVerified: true, stats: { views: 8000, likes: 400, comments: 20, shares: 15 } });
    expect(fetchMock.mock.calls[2][0]).toContain("/m2/insights?metric=views,likes,comments,shares");
  });
  it("signale un Reel absent du compte", async () => {
    fetchMock.mockResolvedValueOnce(ok({ data: [{ id: "m1", shortcode: "AAA" }] }));
    const r = await instagramProvider({ ...ctx, platform: "INSTAGRAM", externalId: "ZZZ", account });
    expect(r?.ownershipVerified).toBe(false);
  });
});

describe("YouTube", () => {
  it("clé API seule : stats publiques, propriété non vérifiable", async () => {
    process.env.YOUTUBE_API_KEY = "key";
    fetchMock.mockResolvedValueOnce(ok({ items: [{ statistics: { viewCount: "1200", likeCount: "80", commentCount: "4" }, snippet: { channelId: "UCx" } }] }));
    const r = await youtubeProvider({ ...ctx, platform: "YOUTUBE", externalId: "abc", account: null });
    expect(r).toMatchObject({ ownershipVerified: null, audienceShare: null, stats: { views: 1200 } });
  });
  it("chaîne connectée : propriété + pays des spectateurs", async () => {
    fetchMock
      .mockResolvedValueOnce(ok({ items: [{ statistics: { viewCount: "10000" }, snippet: { channelId: "UCme" } }] }))
      .mockResolvedValueOnce(ok({ rows: [["FR", 6000], ["BE", 1000], ["IN", 3000]] }));
    const r = await youtubeProvider({ ...ctx, platform: "YOUTUBE", externalId: "abc", account: { accessToken: "g", externalUserId: "UCme" } });
    expect(r?.ownershipVerified).toBe(true);
    expect(r?.audienceShare).toBeCloseTo(0.7);
    expect(fetchMock.mock.calls[1][0]).toContain("filters=video%3D%3Dabc");
  });
  it("vidéo d'une autre chaîne", async () => {
    fetchMock.mockResolvedValueOnce(ok({ items: [{ statistics: { viewCount: "10" }, snippet: { channelId: "UCother" } }] }));
    const r = await youtubeProvider({ ...ctx, platform: "YOUTUBE", externalId: "abc", account: { accessToken: "g", externalUserId: "UCme" } });
    expect(r?.ownershipVerified).toBe(false);
    expect(fetchMock).toHaveBeenCalledTimes(1); // pas d'analytique pour une vidéo qui n'est pas la sienne
  });
});

describe("connexion des comptes (échange du code)", () => {
  it("TikTok : jeton + profil", async () => {
    process.env.TIKTOK_CLIENT_KEY = "ck";
    process.env.TIKTOK_CLIENT_SECRET = "cs";
    fetchMock
      .mockResolvedValueOnce(ok({ access_token: "at", refresh_token: "rt", expires_in: 86400, open_id: "open-1", scope: "user.info.basic,video.list" }))
      .mockResolvedValueOnce(ok({ data: { user: { open_id: "open-1", display_name: "Léa" } } }));
    const t = await PROVIDERS.TIKTOK.exchange("code");
    expect(t).toMatchObject({ accessToken: "at", refreshToken: "rt", externalUserId: "open-1", username: "Léa" });
    expect(String(fetchMock.mock.calls[0][1].body)).toContain("grant_type=authorization_code");
  });
  it("Instagram : jeton court → jeton longue durée → profil (format data[])", async () => {
    process.env.INSTAGRAM_APP_ID = "id";
    process.env.INSTAGRAM_APP_SECRET = "secret";
    fetchMock
      .mockResolvedValueOnce(ok({ data: [{ access_token: "short", user_id: 17841, permissions: "instagram_business_basic" }] }))
      .mockResolvedValueOnce(ok({ access_token: "long", expires_in: 5184000 }))
      .mockResolvedValueOnce(ok({ user_id: "17841", id: "1", username: "lea.clips" }));
    const t = await PROVIDERS.INSTAGRAM.exchange("code#_");
    expect(t).toMatchObject({ accessToken: "long", externalUserId: "17841", username: "@lea.clips", expiresIn: 5184000 });
    expect(new URLSearchParams(String(fetchMock.mock.calls[0][1].body)).get("code")).toBe("code"); // le suffixe « #_ » ajouté par Instagram est retiré
  });
  it("Google : refuse un compte sans chaîne YouTube", async () => {
    process.env.GOOGLE_CLIENT_ID = "g";
    process.env.GOOGLE_CLIENT_SECRET = "s";
    fetchMock.mockResolvedValueOnce(ok({ access_token: "at", expires_in: 3600, scope: "x" })).mockResolvedValueOnce(ok({ items: [] }));
    await expect(PROVIDERS.YOUTUBE.exchange("code")).rejects.toThrow("pas de chaîne");
  });
});

describe("anti-fraude et audience", () => {
  it("part d'audience francophone", () => {
    expect(audienceShare([["FR", 50], ["US", 50]])).toBe(0.5);
    expect(audienceShare([])).toBeNull();
  });
  it("vidéo absente du compte connecté → quarantaine", () => {
    const r = analyzeClip({ views: 100, likes: 10, comments: 0, shares: 0, snapshots: [], submittedAt: new Date(), ownershipVerified: false });
    expect(r.reasons.map((x) => x.code)).toEqual(["NOT_OWNER"]);
    expect(r.score).toBeGreaterThanOrEqual(50);
  });
});

describe("Meta signed_request", () => {
  const sign = (payload: object, secret: string) => {
    const p = Buffer.from(JSON.stringify(payload)).toString("base64url");
    return `${createHmac("sha256", secret).update(p).digest("base64url")}.${p}`;
  };
  it("valide une requête signée", () => expect(parseSignedRequest(sign({ user_id: "42", algorithm: "HMAC-SHA256" }, "s"), "s")).toMatchObject({ user_id: "42" }));
  it("refuse une mauvaise signature", () => expect(parseSignedRequest(sign({ user_id: "42" }, "autre"), "s")).toBeNull());
});
