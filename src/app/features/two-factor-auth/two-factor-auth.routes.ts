import { Routes } from '@angular/router';
import { TwoFactorSetup } from './two-factor-setup/two-factor-setup';
import { TwoFactorVerify } from './two-factor-verify/two-factor-verify';
import { TwoFactorRecovery } from './two-factor-recovery/two-factor-recovery';
import { TwoFactorDisable } from './two-factor-disable/two-factor-disable';

export const TWO_FACTOR_AUTH_ROUTES: Routes = [
  { path: 'setup', component: TwoFactorSetup },
  { path: 'verify', component: TwoFactorVerify },
  { path: 'recovery', component: TwoFactorRecovery },
  { path: 'disable', component: TwoFactorDisable },
];
