import { CanActivateFn, Router } from '@angular/router';
import { environment } from '../../environments/environment';
import { inject } from '@angular/core';
import { AdminService } from '../services/admin.service';
import { catchError, map, of } from 'rxjs';

const ADMIN_PASSWORD = 'ADMIN_PASSWORD';

export const homepageGuard: CanActivateFn = () => {
  if (environment.production) {
    const router = inject(Router);
    const adminService = inject(AdminService);
    let mdpAdmin = localStorage.getItem(ADMIN_PASSWORD);
    if (!mdpAdmin) {
      mdpAdmin = prompt('Mot de passe pour acceder au site :');
    }
    return adminService.checkAdmin(mdpAdmin || '').pipe(
      map(() => {
        localStorage.setItem(ADMIN_PASSWORD, mdpAdmin || '');
        return true;
      }),
      catchError(() => of(router.parseUrl('/403'))),
    );
  }

  return true;
};
