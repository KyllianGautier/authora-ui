import { Routes } from '@angular/router';
import { langGuard } from './core/guards/lang.guard';
import { NotFound } from './features/not-found/not-found';
import { Confirmation } from './shared/components/confirmation/confirmation';
import { Redirection } from './shared/components/redirection/redirection';

export const routes: Routes = [
  {
    path: ':lang',
    canActivate: [langGuard],
    children: [
      {
        path: 'sign-in',
        loadChildren: () =>
          import('./features/sign-in/sign-in.routes').then((m) => m.SIGN_IN_ROUTES),
      },
      {
        path: 'sign-up',
        loadChildren: () =>
          import('./features/sign-up/sign-up.routes').then((m) => m.SIGN_UP_ROUTES),
      },
      {
        path: 'change-password',
        loadChildren: () =>
          import('./features/change-password/change-password.routes').then(
            (m) => m.CHANGE_PASSWORD_ROUTES
          ),
      },
      {
        path: 'delete-account',
        loadChildren: () =>
          import('./features/delete-account/delete-account.routes').then(
            (m) => m.DELETE_ACCOUNT_ROUTES
          ),
      },
      {
        path: 'mfa',
        loadChildren: () =>
          import('./features/two-factor-auth/two-factor-auth.routes').then(
            (m) => m.TWO_FACTOR_AUTH_ROUTES
          ),
      },
      { path: 'confirmation', component: Confirmation },
      { path: 'redirect', component: Redirection },
      { path: '**', component: NotFound },
    ],
  },
  { path: '**', component: NotFound },
];
