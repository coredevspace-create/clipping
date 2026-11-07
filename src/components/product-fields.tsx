import { PRODUCT_TYPES } from "@/lib/product";

type W = { productType?: string; productUrl?: string | null; appStoreUrl?: string | null; playStoreUrl?: string | null; appStoreProviderToken?: string | null };

/** Champs « Ton produit » : type + liens. Le lien de chaque clippeur redirige vers le bon store selon l'appareil. */
export function ProductFields({ w = {} }: { w?: W }) {
  return (
    <div className="space-y-4">
      <fieldset>
        <legend className="label">Type de produit</legend>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {Object.entries(PRODUCT_TYPES).map(([k, t]) => (
            <label key={k} className="cursor-pointer rounded-xl border border-ink/15 px-3 py-2.5 text-sm has-[:checked]:border-ink has-[:checked]:bg-ink has-[:checked]:text-paper">
              <input type="radio" name="productType" value={k} defaultChecked={(w.productType ?? "APP") === k} className="sr-only" />
              <span className="font-semibold">{t.label}</span>
              <span className="block text-xs opacity-60">suivi des {t.conversions}</span>
            </label>
          ))}
        </div>
      </fieldset>
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label className="label">Lien App Store</label>
          <input name="appStoreUrl" defaultValue={w.appStoreUrl ?? ""} placeholder="https://apps.apple.com/fr/app/…/id123" className="input" />
        </div>
        <div>
          <label className="label">Lien Play Store</label>
          <input name="playStoreUrl" defaultValue={w.playStoreUrl ?? ""} placeholder="https://play.google.com/store/apps/details?id=…" className="input" />
        </div>
        <div className="sm:col-span-2">
          <label className="label">Site web (SaaS, landing page)</label>
          <input name="productUrl" defaultValue={w.productUrl ?? ""} placeholder="https://monapp.fr" className="input" />
        </div>
      </div>
      <details className="rounded-xl bg-paper p-3 text-sm">
        <summary className="cursor-pointer font-medium">App Store : voir les téléchargements de chaque clippeur (facultatif)</summary>
        <div className="mt-3 space-y-2 text-zinc-600">
          <p>
            Dans App Store Connect, va dans <strong>Analytics → Sources → Campagnes</strong> et copie ton <strong>provider token</strong> (le nombre après <code>pt=</code>
            dans un lien de campagne). Chaque clippeur apparaîtra alors comme une campagne « clipsquad-code ».
          </p>
          <input name="appStoreProviderToken" defaultValue={w.appStoreProviderToken ?? ""} placeholder="Ex. 123456789" inputMode="numeric" className="input" />
          <p className="text-xs">Côté Android, les clippeurs apparaissent dans la Play Console (Acquisition → sources UTM, utm_content = code du clippeur).</p>
        </div>
      </details>
    </div>
  );
}
