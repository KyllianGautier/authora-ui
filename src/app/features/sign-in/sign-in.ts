import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { RedirectService } from '../../core/services/redirect.service';
import { BackToPageService } from '../../core/services/back-to-page.service';
import { TranslocoDirective, TranslocoService } from '@jsverse/transloco';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AuthLayout, AuthLayoutTitle } from '../../shared/components/auth-layout/auth-layout';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { OrDivider } from '../../shared/components/or-divider/or-divider';

interface SignInForm {
  email: FormControl<string>;
  password: FormControl<string>;
  rememberMe: FormControl<boolean>;
}

@Component({
  selector: 'app-sign-in',
  imports: [
    ReactiveFormsModule,
    RouterLink,
    TranslocoDirective,
    AuthLayout,
    AuthLayoutTitle,
    MatFormFieldModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    MatCheckboxModule,
    OrDivider,
  ],
  templateUrl: './sign-in.html',
  styleUrl: './sign-in.scss',
})
export class SignIn {
  readonly emailFC = new FormControl<string>('', {
    validators: [Validators.required, Validators.email],
    nonNullable: true,
  });
  readonly passwordFC = new FormControl<string>('', {
    validators: [Validators.required],
    nonNullable: true,
  });
  readonly rememberMeFC = new FormControl<boolean>(false, {
    nonNullable: true,
  });

  readonly signInFG = new FormGroup<SignInForm>({
    email: this.emailFC,
    password: this.passwordFC,
    rememberMe: this.rememberMeFC,
  });

  private readonly redirectService = inject(RedirectService);
  readonly backToPageService = inject(BackToPageService);
  private readonly snackBar = inject(MatSnackBar);
  private readonly transloco = inject(TranslocoService);
  private readonly api = inject(ApiService);

  readonly submitting = signal(false);

  constructor() {
    this.redirectService.init();
  }

  onSubmit(): void {
    if (this.signInFG.invalid) {
      this.signInFG.markAllAsTouched();
      return;
    }

    this.submitting.set(true);

    const { email, password, rememberMe } = this.signInFG.getRawValue();
    const redirectUrl = this.redirectService.redirectTo() ?? undefined;
    this.api.signIn(email, password, rememberMe, redirectUrl).subscribe({
      next: (result) => {
        this.submitting.set(false);
        if (result.redirectUrl) {
          const url = new URL(result.redirectUrl);
          url.searchParams.set('exchangeToken', result.exchangeToken);
          window.location.href = url.toString();
        } else {
          this.redirectService.complete(
            this.transloco.translate('signIn.successTitle'),
            this.transloco.translate('signIn.successDescription'),
          );
        }
      },
      error: () => {
        this.submitting.set(false);
        this.passwordFC.reset();
        this.snackBar.open(this.transloco.translate('signIn.errors.invalidCredentials'), undefined, {
          duration: 5000,
        });
      },
    });
  }
}
