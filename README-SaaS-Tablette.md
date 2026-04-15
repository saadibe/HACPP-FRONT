# Frontend SaaS tablette

## 1. Configurer l'URL API
Édite `src/assets/config.js` :

```js
window.__APP_CONFIG__ = {
  apiBaseUrl: "https://api.votre-domaine.fr/api"
};
```

## 2. Build production
```bash
npm install
npm run build
```

## 3. Mise en ligne
Déploie le contenu du dossier `dist/haccp-frontend/browser`.

## 4. Tablette
Ouvre l'URL sur la tablette, puis ajoute l'application à l'écran d'accueil.
