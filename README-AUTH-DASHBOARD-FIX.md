# Correctif frontend login / dashboard

## Inclus
- `auth.guard.ts`
- `login.guard.ts`
- `root-redirect.guard.ts`
- `app.routes.ts` corrigé

## Comportement
- non connecté -> `/login`
- connecté -> `/dashboard`

## Important dans le login
Après succès du login, il faut stocker :

```ts
localStorage.setItem('token', response.token);
localStorage.setItem('username', response.username);
localStorage.setItem('role', response.role);
localStorage.setItem('restaurantId', String(response.restaurantId));
this.router.navigate(['/dashboard']);
```

## Important dans le logout
```ts
localStorage.removeItem('token');
localStorage.removeItem('username');
localStorage.removeItem('role');
localStorage.removeItem('restaurantId');
location.href = '/login';
```
