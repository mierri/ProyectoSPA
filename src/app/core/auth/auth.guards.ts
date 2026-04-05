import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { TempAuthService } from './auth.service';

export const authGuard: CanActivateFn = () => {
	const auth = inject(TempAuthService);
	const router = inject(Router);
	return auth.isAuthenticated() ? true : router.createUrlTree(['/login']);
};

export const loggedOutGuard: CanActivateFn = () => {
	const auth = inject(TempAuthService);
	const router = inject(Router);
	return auth.isAuthenticated() ? router.createUrlTree(['/app']) : true;
};
