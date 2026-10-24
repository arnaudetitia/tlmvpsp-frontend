import { CanActivateFn, Router } from '@angular/router';
import { environment } from '../../environments/environment';
import { inject } from '@angular/core';
import { EtatPartieUtil } from '../utils/etat-partie.util';
import moment from 'moment';

export const homepageGuard: CanActivateFn = () => {
  if (environment.production) {
    const router = inject(Router);
    let mdpAdmin = localStorage.getItem(EtatPartieUtil.ALREADY_LOGGED);
    if (!mdpAdmin || isExpired()) {
      return router.parseUrl('/login');
    }
    return true;
  }

  return true;
};

const isExpired: () => boolean = () => {
  const dateExpirationString = localStorage.getItem(EtatPartieUtil.EXPIRATION_DATE);

  if (!dateExpirationString) {
    localStorage.clear();
    return true;
  }

  const dateExpiration = moment(dateExpirationString);
  const dateCourante = moment();

  if (dateCourante.isAfter(dateExpiration)) {
    localStorage.clear();
    return true;
  }

  return false;
};
