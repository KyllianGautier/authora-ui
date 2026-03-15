import { Routes } from '@angular/router';
import { DeleteAccount } from './delete-account';
import { DeleteAccountVerify } from './delete-account-verify/delete-account-verify';

export const DELETE_ACCOUNT_ROUTES: Routes = [
  { path: '', component: DeleteAccount },
  { path: 'verify', component: DeleteAccountVerify },
];
