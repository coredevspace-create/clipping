/**
 * Connexion des comptes des clippeurs (OAuth 2.0).
 *  - TikTok : Login Kit + Display API (scopes user.info.basic, video.list)
 *  - Instagram : API Instagram avec Instagram Login (instagram_business_basic, instagram_business_manage_insights)
 *  - YouTube : Google OAuth (youtube.readonly, yt-analytics.readonly)
 * Chaque fournisseur n'est actif que si ses identifiants sont présents dans les variables d'environnement.
 */
import { appUrl } from "../config";

export type OAuthPlatform = "TIKTOK" | "INSTAGRAM" | "YOUTUBE";
export const OAUTH_PLATFORMS: OAuthPlatform[] = ["TIKTOK", "INSTAGRAM", "YOUTUBE"];

export type TokenSet = { accessToken: string; refreshToken?: string | null; expiresIn?: number | null; scopes?: string };
export type Identity = { externalUserId: string; username: string };

export type Provider = {
  platform: OAuthPlatform;
  label: string;
  envHint: string;
  configured: () => boolean;
  authorizeUrl: (state: string) => string;
  exchange: (code: string) => Promise<TokenSet & Identity>;
  refresh: (refreshOrAccessToken: string) => Promise<TokenSet>;
};

export const IG_VERSION = () => process.env.INSTAGRAM_GRAPH_VERSION || "v23.0";
export const redirectUri = (p: OAuthPlatform) => `${appUrl()}/api/oauth/${p.toLowerCase()}/callback`;

async function json<T>(res: Response, what: string): Promise<T> {
  const body = await res.json().catch(() => ({}));
  if (!res.ok || (body as { error?: unknown }).error) {
    const e = (body as { error?: { message?: string } | string; error_description?: string; error_message?: string });
    const msg = typeof e.error === "string" ? e.error_description ?? e.error : e.error?.message ?? e.error_message;
    throw new Error(`${what} : ${msg ?? res.status}`);
  }
  return body as T;
}

const form = (data: Record<string, string>) => ({
  method: "POST",
  headers: { "Content-Type": "application/x-www-form-urlencoded" },
  body: new URLSearchParams(data).toString(),
});

// ——— TikTok ———
const tiktok: Provider = {
  platform: "TIKTOK",
  label: "TikTok",
  envHint: "TIKTOK_CLIENT_KEY / TIKTOK_CLIENT_SECRET",
  configured: () => !!(process.env.TIKTOK_CLIENT_KEY && process.env.TIKTOK_CLIENT_SECRET),
  authorizeUrl: (state) =>
    `https://www.tiktok.com/v2/auth/authorize/?${new URLSearchParams({
      client_key: process.env.TIKTOK_CLIENT_KEY!,
      scope: "user.info.basic,video.list",
      response_type: "code",
      redirect_uri: redirectUri("TIKTOK"),
      state,
    })}`,
  async exchange(code) {
    const t = await json<{ access_token: string; refresh_token: string; expires_in: number; open_id: string; scope: string }>(
      await fetch("https://open.tiktokapis.com/v2/oauth/token/", form({
        client_key: process.env.TIKTOK_CLIENT_KEY!,
        client_secret: process.env.TIKTOK_CLIENT_SECRET!,
        code,
        grant_type: "authorization_code",
        redirect_uri: redirectUri("TIKTOK"),
      })),
      "TikTok (jeton)",
    );
    const u = await json<{ data: { user: { open_id: string; display_name?: string } } }>(
      await fetch("https://open.tiktokapis.com/v2/user/info/?fields=open_id,display_name", { headers: { Authorization: `Bearer ${t.access_token}` } }),
      "TikTok (profil)",
    );
    return {
      accessToken: t.access_token,
      refreshToken: t.refresh_token,
      expiresIn: t.expires_in,
      scopes: t.scope,
      externalUserId: t.open_id,
      username: u.data.user.display_name || "Compte TikTok",
    };
  },
  async refresh(refreshToken) {
    const t = await json<{ access_token: string; refresh_token: string; expires_in: number; scope: string }>(
      await fetch("https://open.tiktokapis.com/v2/oauth/token/", form({
        client_key: process.env.TIKTOK_CLIENT_KEY!,
        client_secret: process.env.TIKTOK_CLIENT_SECRET!,
        grant_type: "refresh_token",
        refresh_token: refreshToken,
      })),
      "TikTok (rafraîchissement)",
    );
    return { accessToken: t.access_token, refreshToken: t.refresh_token, expiresIn: t.expires_in, scopes: t.scope };
  },
};

// ——— Instagram (API Instagram avec Instagram Login) ———
const instagram: Provider = {
  platform: "INSTAGRAM",
  label: "Instagram",
  envHint: "INSTAGRAM_APP_ID / INSTAGRAM_APP_SECRET",
  configured: () => !!(process.env.INSTAGRAM_APP_ID && process.env.INSTAGRAM_APP_SECRET),
  authorizeUrl: (state) =>
    `https://www.instagram.com/oauth/authorize?${new URLSearchParams({
      client_id: process.env.INSTAGRAM_APP_ID!,
      redirect_uri: redirectUri("INSTAGRAM"),
      response_type: "code",
      scope: "instagram_business_basic,instagram_business_manage_insights",
      state,
    })}`,
  async exchange(code) {
    type Short = { access_token: string; user_id: string | number; permissions?: string | string[] };
    const raw = await json<Short | { data: Short[] }>(
      await fetch("https://api.instagram.com/oauth/access_token", form({
        client_id: process.env.INSTAGRAM_APP_ID!,
        client_secret: process.env.INSTAGRAM_APP_SECRET!,
        grant_type: "authorization_code",
        redirect_uri: redirectUri("INSTAGRAM"),
        code: code.replace(/#_$/, ""),
      })),
      "Instagram (jeton)",
    );
    const short = "data" in raw ? raw.data[0] : raw;
    // jeton longue durée (60 jours)
    const long = await json<{ access_token: string; expires_in: number }>(
      await fetch(`https://graph.instagram.com/access_token?${new URLSearchParams({
        grant_type: "ig_exchange_token",
        client_secret: process.env.INSTAGRAM_APP_SECRET!,
        access_token: short.access_token,
      })}`),
      "Instagram (jeton longue durée)",
    );
    const me = await json<{ user_id?: string; id: string; username: string }>(
      await fetch(`https://graph.instagram.com/${IG_VERSION()}/me?fields=user_id,username&access_token=${encodeURIComponent(long.access_token)}`),
      "Instagram (profil)",
    );
    return {
      accessToken: long.access_token,
      refreshToken: null,
      expiresIn: long.expires_in,
      scopes: Array.isArray(short.permissions) ? short.permissions.join(",") : short.permissions ?? "",
      externalUserId: String(short.user_id ?? me.user_id ?? me.id),
      username: `@${me.username}`,
    };
  },
  async refresh(accessToken) {
    const t = await json<{ access_token: string; expires_in: number }>(
      await fetch(`https://graph.instagram.com/refresh_access_token?grant_type=ig_refresh_token&access_token=${encodeURIComponent(accessToken)}`),
      "Instagram (rafraîchissement)",
    );
    return { accessToken: t.access_token, expiresIn: t.expires_in };
  },
};

// ——— YouTube (Google) ———
const YT_SCOPES = "https://www.googleapis.com/auth/youtube.readonly https://www.googleapis.com/auth/yt-analytics.readonly";
const youtube: Provider = {
  platform: "YOUTUBE",
  label: "YouTube",
  envHint: "GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET",
  configured: () => !!(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET),
  authorizeUrl: (state) =>
    `https://accounts.google.com/o/oauth2/v2/auth?${new URLSearchParams({
      client_id: process.env.GOOGLE_CLIENT_ID!,
      redirect_uri: redirectUri("YOUTUBE"),
      response_type: "code",
      scope: YT_SCOPES,
      access_type: "offline",
      prompt: "consent",
      include_granted_scopes: "true",
      state,
    })}`,
  async exchange(code) {
    const t = await json<{ access_token: string; refresh_token?: string; expires_in: number; scope: string }>(
      await fetch("https://oauth2.googleapis.com/token", form({
        client_id: process.env.GOOGLE_CLIENT_ID!,
        client_secret: process.env.GOOGLE_CLIENT_SECRET!,
        code,
        grant_type: "authorization_code",
        redirect_uri: redirectUri("YOUTUBE"),
      })),
      "Google (jeton)",
    );
    const ch = await json<{ items?: { id: string; snippet: { title: string; customUrl?: string } }[] }>(
      await fetch("https://www.googleapis.com/youtube/v3/channels?part=snippet&mine=true", { headers: { Authorization: `Bearer ${t.access_token}` } }),
      "YouTube (chaîne)",
    );
    const c = ch.items?.[0];
    if (!c) throw new Error("Ce compte Google n'a pas de chaîne YouTube.");
    return {
      accessToken: t.access_token,
      refreshToken: t.refresh_token ?? null,
      expiresIn: t.expires_in,
      scopes: t.scope,
      externalUserId: c.id,
      username: c.snippet.customUrl || c.snippet.title,
    };
  },
  async refresh(refreshToken) {
    const t = await json<{ access_token: string; expires_in: number; scope: string }>(
      await fetch("https://oauth2.googleapis.com/token", form({
        client_id: process.env.GOOGLE_CLIENT_ID!,
        client_secret: process.env.GOOGLE_CLIENT_SECRET!,
        grant_type: "refresh_token",
        refresh_token: refreshToken,
      })),
      "Google (rafraîchissement)",
    );
    return { accessToken: t.access_token, refreshToken, expiresIn: t.expires_in, scopes: t.scope };
  },
};

export const PROVIDERS: Record<OAuthPlatform, Provider> = { TIKTOK: tiktok, INSTAGRAM: instagram, YOUTUBE: youtube };

export const providerFromSlug = (slug: string): Provider | null => PROVIDERS[slug.toUpperCase() as OAuthPlatform] ?? null;
