import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { TranslocoService } from '@jsverse/transloco';

const SUPPORTED_LANGS = ['en', 'fr', 'es', 'de'];
const DEFAULT_LANG = 'en';

export const langGuard: CanActivateFn = (route) => {
  const transloco = inject(TranslocoService);
  const router = inject(Router);
  const lang = route.paramMap.get('lang');

  if (lang && SUPPORTED_LANGS.includes(lang)) {
    transloco.setActiveLang(lang);
    return true;
  }

  return router.createUrlTree([`/${DEFAULT_LANG}/dashboard`]);
};
