import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { TranslocoDirective } from '@jsverse/transloco';
import { MatIcon } from '@angular/material/icon';
import { AuthLayout, AuthLayoutTitle } from '../auth-layout/auth-layout';

@Component({
  selector: 'app-confirmation',
  imports: [TranslocoDirective, AuthLayout, AuthLayoutTitle, MatIcon],
  templateUrl: './confirmation.html',
  styleUrl: './confirmation.scss',
})
export class Confirmation {
  private readonly router = inject(Router);
  private readonly navigation = this.router.getCurrentNavigation()?.extras.state ?? history.state;

  readonly title: string = this.navigation?.['title'] ?? '';
  readonly message: string = this.navigation?.['message'] ?? '';
}
