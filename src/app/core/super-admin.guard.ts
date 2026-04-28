import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';

export const superAdminGuard: CanActivateFn = () => {
  const router = inject(Router);
  const role = localStorage.getItem('role');

  if (role === 'SUPER_ADMIN') {
    return true;
  }

  return router.createUrlTree(['/dashboard']);
};