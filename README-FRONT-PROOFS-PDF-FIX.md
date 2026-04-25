# Frontend ZIP corrigé

## Inclus
- multi-photo cumulée dans une même preuve de traçabilité
- petits boutons icône pour les actions photo
- affichage galerie plus propre
- export PDF hygiène via requête authentifiée (`HttpClient` + blob)
- composants :
  - `UsersComponent`
  - `HygieneReportComponent`

## À ajouter dans `app.routes.ts`
```ts
import { UsersComponent } from './features/users/users.component';
import { HygieneReportComponent } from './features/hygiene-report/hygiene-report.component';

{ path: 'users', component: UsersComponent },
{ path: 'hygiene-report', component: HygieneReportComponent },
```

## À ajouter dans le menu
- Utilisateurs
- Rapport hygiène
