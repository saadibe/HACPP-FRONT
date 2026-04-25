# La Perla HACCP - FULL PRO PWA

## Inclus
- vraie route `/dashboard`
- redirection :
  - non connecté -> `/login`
  - connecté -> `/dashboard`
- page Dashboard professionnelle
- page History séparée avec filtres par type
- preuves Frigo :
  - caméra tablette/téléphone
  - import multiple
  - plusieurs photos dans une même preuve
- preuves Nettoyage :
  - caméra tablette/téléphone
  - import multiple
  - plusieurs photos dans une même preuve
- Traçabilité :
  - preuves multiples
  - plusieurs photos/fichiers par preuve
- Export PDF hygiène via requête authentifiée
- Header/sidebar propre avec menu utilisateur
- PWA installable Android :
  - manifest.webmanifest
  - ngsw-config.json
  - icônes 72 à 512
  - rewrite Render/Netlify `public/_redirects`

## Installation
```bash
npm install
npm run build
```

## Android
Ouvrir l'URL dans Chrome puis :
Menu ⋮ -> Installer l'application / Ajouter à l'écran d'accueil.
