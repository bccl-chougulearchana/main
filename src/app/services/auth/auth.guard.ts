import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AutheticationService } from './authetication.service';

export const authGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const authService = inject(AutheticationService);

  if (authService.isLoggedIn()) {
    return true;
  }

  return router.createUrlTree(['/login']);  
};

