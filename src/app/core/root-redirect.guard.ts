import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

export const rootRedirectGuard: CanActivateFn = () => {
  const router = inject(Router);
  const token = localStorage.getItem('token');
  return router.createUrlTree([token ? '/dashboard' : '/login']);
};
