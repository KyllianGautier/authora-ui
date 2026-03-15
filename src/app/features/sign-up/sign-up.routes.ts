import { Routes } from '@angular/router';
import { SignUp } from './sign-up';
import { Verify } from './verify/verify';

export const SIGN_UP_ROUTES: Routes = [
  { path: '', component: SignUp },
  { path: 'verify', component: Verify },
];
