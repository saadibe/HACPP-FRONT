import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

export const authGuard: CanActivateFn = () => {
  const router = inject(Router);
  return localStorage.getItem('token')
    ? true
    : router.createUrlTree(['/login']);
};