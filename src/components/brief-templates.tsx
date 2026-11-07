"use client";

/** Modèles de consignes pour les clippeurs, spécialisés logiciels grand public. Un clic remplit le champ « Exigences ». */
const BASE = `Règles communes :
• Format vertical 9:16, 15 à 45 secondes, sous-titres obligatoires
• Hook dans les 2 premières secondes (le problème, pas le nom de l'app)
• Nom de l'app visible à l'écran + « lien en bio » à la fin
• Ton code de vérification dans la description
• Interdit : vues achetées, fausses promesses, contenu d'un autre créateur`;

const TEMPLATES = [
  {
    name: "Démo express",
    text: `Format « démo express » : montre l'app qui résout un problème concret.
1. Le problème en une phrase (« Je n'arrivais jamais à… »)
2. L'écran clé de l'app en action (enregistrement d'écran)
3. Le résultat avant / après`,
  },
  {
    name: "Faceless",
    text: `Format « faceless » (sans visage) : enregistrement d'écran + texte à l'écran + musique tendance.
• Une astuce ou une liste (« 3 apps qui m'ont changé la vie ») avec notre app en n°1
• Texte gros et lisible, une idée par plan`,
  },
  {
    name: "Réaction / avis",
    text: `Format « réaction » : face caméra, tu découvres l'app et tu réagis honnêtement.
• Ta vraie première impression, pas de script récité
• Montre au moins une fonctionnalité précise à l'écran`,
  },
  {
    name: "Storytime",
    text: `Format « storytime » : une histoire courte où l'app est la solution.
• Situation relatable (budget, sport, études, organisation…)
• Le moment où l'app change la donne, montré à l'écran`,
  },
];

export function BriefTemplates() {
  const fill = (text: string) => {
    const el = document.querySelector<HTMLTextAreaElement>('textarea[name="requirements"]');
    if (!el) return;
    el.value = `${text}\n\n${BASE}`;
    el.focus();
  };
  return (
    <div className="flex flex-wrap gap-1.5">
      <span className="text-xs text-zinc-500">Modèles :</span>
      {TEMPLATES.map((t) => (
        <button key={t.name} type="button" onClick={() => fill(t.text)} className="rounded-full border border-ink/15 bg-white px-2.5 py-0.5 text-xs font-medium hover:border-ink hover:bg-lime">
          {t.name}
        </button>
      ))}
    </div>
  );
}
