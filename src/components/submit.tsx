"use client";

import { useFormStatus } from "react-dom";

/** Bouton d'envoi de formulaire : affiche un indicateur de chargement et bloque le double clic. */
export function Submit({ className = "btn", children, ...rest }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const { pending } = useFormStatus();
  return (
    <button {...rest} type="submit" className={`${className} relative`} disabled={pending || rest.disabled} aria-busy={pending}>
      <span className={pending ? "invisible" : undefined}>{children}</span>
      {pending && (
        <span className="absolute inset-0 grid place-items-center">
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-r-transparent" />
        </span>
      )}
    </button>
  );
}
