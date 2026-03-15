import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslocoDirective, TranslocoService } from '@jsverse/transloco';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AuthLayout, AuthLayoutTitle } from '../../../shared/components/auth-layout/auth-layout';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { ApiService } from '../../../core/services/api.service';
import { BackToPageService } from '../../../core/services/back-to-page.service';

@Component({
  selector: 'app-two-factor-verify',
  imports: [
    ReactiveFormsModule,
    TranslocoDirective,
    AuthLayout,
    AuthLayoutTitle,
    MatFormFieldModule,
    MatButtonModule,
    MatInputModule,
  ],
  templateUrl: './two-factor-verify.html',
  styleUrl: './two-factor-verify.scss',
})
export class TwoFactorVerify {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly api = inject(ApiService);
  private readonly snackBar = inject(MatSnackBar);
  private readonly transloco = inject(TranslocoService);
  readonly backToPageService = inject(BackToPageService);

  private readonly navigation = this.router.getCurrentNavigation()?.extras.state ?? history.state;
  private readonly email: string = this.navigation?.['email'] ?? '';
  private readonly password: string = this.navigation?.['password'] ?? '';
  readonly qrcode: string = this.navigation?.['qrcode'] ?? '';
  readonly manualCode: string = this.navigation?.['manualCode'] ?? '';

  readonly codeFC = new FormControl<string>('', {
    validators: [Validators.required, Validators.minLength(6), Validators.maxLength(6)],
    nonNullable: true,
  });

  readonly submitting = signal(false);

  onSubmit(): void {
    if (this.codeFC.invalid) {
      this.codeFC.markAsTouched();
      return;
    }

    this.submitting.set(true);

    this.api.verifyMfa(this.email, this.password, this.codeFC.value).subscribe({
      next: (result) => {
        this.submitting.set(false);
        this.backToPageService.push();
        this.router.navigate(['../recovery'], {
          relativeTo: this.route,
          state: { recoveryCodes: result.recoveryCodes },
        });
      },
      error: () => {
        this.submitting.set(false);
        this.codeFC.reset();
        this.snackBar.open(
          this.transloco.translate('mfaSetup.errors.invalidCode'),
          undefined,
          { duration: 5000 },
        );
      },
    });
  }
}
