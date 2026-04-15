# Frontend production

## 1. Configurer l'URL API
Copier le contenu de `src/assets/config.production.js`
dans `src/assets/config.js` avec ton URL backend réelle.

Exemple :
```js
window.__APP_CONFIG__ = {
  apiBaseUrl: "https://api.votre-domaine.fr/api"
};
```

## 2. Build
```bash
npm install
npm run build
```

## 3. Déploiement
Tu peux déployer sur :
- Netlify
- Vercel
- Nginx

## 4. Tablette
Quand le site est en HTTPS, ouvre l'app sur tablette et ajoute-la à l'écran d'accueil.
