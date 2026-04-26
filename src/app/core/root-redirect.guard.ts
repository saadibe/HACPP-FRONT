import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

export const rootRedirectGuard: CanActivateFn = () => {
  const router = inject(Router);

  return router.createUrlTree([
    localStorage.getItem('token') ? '/dashboard' : '/login'
  ]);
};