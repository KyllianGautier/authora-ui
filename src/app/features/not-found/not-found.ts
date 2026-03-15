import { Component } from '@angular/core';
import { TranslocoDirective } from '@jsverse/transloco';
import { AuthLayout, AuthLayoutTitle } from '../../shared/components/auth-layout/auth-layout';

@Component({
  selector: 'app-not-found',
  imports: [TranslocoDirective, AuthLayout, AuthLayoutTitle],
  templateUrl: './not-found.html',
})
export class NotFound {}
