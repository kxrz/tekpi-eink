# CLAUDE.md — tekpi-eink

## Projet

Affichage dynamique sur écran e-ink couleur Pimoroni Inky Frame 7.3" (PIM773).
Architecture : Next.js App Router déployé sur Vercel + script Python sur Raspberry Pi Zero 2 W.

## Stack

- **Framework** : Next.js 14+ App Router (TypeScript strict)
- **Style** : Tailwind CSS, mobile-first, fond sombre
- **Stockage** : Vercel Blob (`@vercel/blob`)
- **Traitement image** : Sharp + dithering Floyd-Steinberg custom (voir `lib/dither.ts`)
- **Déploiement** : Vercel (plan hobby acceptable)

## Contraintes impératives

### Écran ACeP 800×480 — 7 couleurs exactes

La palette matérielle est FIXE. Toute couleur en dehors de ces valeurs exactes est approximée grossièrement par le contrôleur hardware :

```ts
export const ACEP_PALETTE: [number, number, number][] = [
  [0, 0, 0],       // Noir
  [255, 255, 255],  // Blanc
  [0, 255, 0],      // Vert
  [0, 0, 255],      // Bleu
  [255, 0, 0],      // Rouge
  [255, 255, 0],    // Jaune
  [255, 128, 0],    // Orange
];
```

**NE PAS utiliser** `sharp().png({ palette: true, colors: 7 })` seul — cela choisit les 7 couleurs dominantes de l'image, pas la palette ACeP. Le dithering custom dans `lib/dither.ts` est obligatoire.

### Route `/api/next-image`

- Sortie : PNG, `Content-Type: image/png`
- Headers : `Cache-Control: no-store, no-cache, must-revalidate, proxy-revalidate`
- Dimensions exactes : 800 × 480 px, mode `cover`
- Rotation d'images : `Math.floor(Date.now() / (4 * 3600 * 1000)) % images.length` (sans état serveur)

### Performance Vercel (plan hobby)

- Mémoire fonction : max ~256MB. Traiter l'image entièrement en mémoire est OK pour 800×480 (≈1.1MB raw).
- Timeout fonction : 10s sur hobby. Sharp est rapide, le dithering JS sur 384 000 pixels aussi.

## Structure des fichiers

```
app/
  layout.tsx
  page.tsx               ← galerie + upload (composition server/client)
  globals.css
  api/
    upload/route.ts      ← POST, upload vers Vercel Blob
    next-image/route.ts  ← GET, traitement + sortie PNG pour le Pi
components/
  UploadForm.tsx         ← "use client", gère le file input et le POST
  Gallery.tsx            ← server component, liste + suppression via server action
lib/
  blob.ts                ← listImages(), deleteImage(url)
  dither.ts              ← ditherToACeP(rawBuffer, width, height): Promise<Buffer>
pi/
  update_display.py      ← script Pi (référence, non exécuté sur Vercel)
```

## Variables d'environnement requises

```
BLOB_READ_WRITE_TOKEN=   # depuis Vercel Dashboard > Storage > Blob
```

Fichier `.env.local` à créer localement (jamais commité). Un `.env.local.example` documente les clés.

## Conventions de code

- TypeScript strict (`"strict": true` dans tsconfig)
- Pas de `any`
- Server components par défaut — `"use client"` seulement si interaction browser nécessaire
- Server Actions pour les mutations (suppression d'image)
- Pas de commentaires évidents — seulement si la logique est non-triviale (ex : formule de rotation, propagation d'erreur Floyd-Steinberg)

## Ce que Cursor NE doit PAS faire

- Ne pas ajouter de base de données (Prisma, Supabase, etc.) — Vercel Blob suffit
- Ne pas ajouter d'authentification dans un premier temps
- Ne pas utiliser `sharp().png({ palette: true })` sans le dithering custom
- Ne pas hardcoder le token Blob dans le code source
- Ne pas ajouter de tests unitaires à ce stade
