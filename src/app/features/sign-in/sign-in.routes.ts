import { Routes } from '@angular/router';
import { SignIn } from './sign-in';
import { ForgotPassword } from './forgot-password/forgot-password';
import { ForgotPasswordVerify } from './forgot-password-verify/forgot-password-verify';
import { MagicLink } from './magic-link/magic-link';
import { MagicLinkValidate } from './magic-link-validate/magic-link-validate';

export const SIGN_IN_ROUTES: Routes = [
  { path: '', component: SignIn },
  { path: 'forgot-password', component: ForgotPassword },
  { path: 'forgot-password/verify', component: ForgotPasswordVerify },
  { path: 'magic-link', component: MagicLink },
  { path: 'magic-link/validate', component: MagicLinkValidate },
];
