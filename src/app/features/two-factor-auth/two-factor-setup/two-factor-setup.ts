import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslocoDirective, TranslocoService } from '@jsverse/transloco';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AuthLayout, AuthLayoutTitle } from '../../../shared/components/auth-layout/auth-layout';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ApiService } from '../../../core/services/api.service';
import { BackToPageService } from '../../../core/services/back-to-page.service';

interface CredentialsForm {
  email: FormControl<string>;
  password: FormControl<string>;
}

@Component({
  selector: 'app-two-factor-setup',
  imports: [
    ReactiveFormsModule,
    TranslocoDirective,
    AuthLayout,
    AuthLayoutTitle,
    MatFormFieldModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
  ],
  templateUrl: './two-factor-setup.html',
  styleUrl: './two-factor-setup.scss',
})
export class TwoFactorSetup {
  readonly emailFC = new FormControl<string>('', {
    validators: [Validators.required, Validators.email],
    nonNullable: true,
  });
  readonly passwordFC = new FormControl<string>('', {
    validators: [Validators.required],
    nonNullable: true,
  });

  readonly credentialsFG = new FormGroup<CredentialsForm>({
    email: this.emailFC,
    password: this.passwordFC,
  });

  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly api = inject(ApiService);
  private readonly snackBar = inject(MatSnackBar);
  private readonly transloco = inject(TranslocoService);
  readonly backToPageService = inject(BackToPageService);

  readonly submitting = signal(false);

  onSubmit(): void {
    if (this.credentialsFG.invalid) {
      this.credentialsFG.markAllAsTouched();
      return;
    }

    this.submitting.set(true);
    const { email, password } = this.credentialsFG.getRawValue();

    this.api.setupMfa(email, password).subscribe({
      next: (result) => {
        this.submitting.set(false);
        this.backToPageService.push();
        this.router.navigate(['../verify'], {
          relativeTo: this.route,
          state: {
            email,
            password,
            qrcode: result.qrcode,
            manualCode: result.manualCode,
          },
        });
      },
      error: () => {
        this.submitting.set(false);
        this.snackBar.open(
          this.transloco.translate('mfaSetup.errors.serverError'),
          undefined,
          { duration: 5000 },
        );
      },
    });
  }
}
