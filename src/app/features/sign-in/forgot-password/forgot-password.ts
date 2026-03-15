import { Component, inject, signal } from '@angular/core';
import { RedirectService } from '../../../core/services/redirect.service';
import { TranslocoDirective, TranslocoService } from '@jsverse/transloco';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AuthLayout, AuthLayoutTitle } from '../../../shared/components/auth-layout/auth-layout';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { ApiService } from '../../../core/services/api.service';
import { MatInputModule } from '@angular/material/input';

@Component({
  selector: 'app-forgot-password',
  imports: [
    ReactiveFormsModule,
    TranslocoDirective,
    AuthLayout,
    AuthLayoutTitle,
    MatFormFieldModule,
    MatButtonModule,
    MatInputModule,
  ],
  templateUrl: './forgot-password.html',
  styleUrl: './forgot-password.scss',
})
export class ForgotPassword {
  private readonly redirectService = inject(RedirectService);
  private readonly snackBar = inject(MatSnackBar);
  private readonly transloco = inject(TranslocoService);
  private readonly api = inject(ApiService);

  readonly emailFC = new FormControl<string>(
    history.state?.['email'] ?? '',
    {
      validators: [Validators.required, Validators.email],
      nonNullable: true,
    },
  );

  readonly submitting = signal(false);

  onSubmit(): void {
    if (this.emailFC.invalid) {
      this.emailFC.markAsTouched();
      return;
    }

    this.submitting.set(true);

    this.api.forgotPassword(this.emailFC.value).subscribe({
      next: () => {
        this.submitting.set(false);
        this.redirectService.complete(
          this.transloco.translate('forgotPassword.successTitle'),
          this.transloco.translate('forgotPassword.successDescription'),
        );
      },
      error: () => {
        this.submitting.set(false);
        this.snackBar.open(
          this.transloco.translate('forgotPassword.errors.serverError'),
          undefined,
          { duration: 5000 },
        );
      },
    });
  }
}
