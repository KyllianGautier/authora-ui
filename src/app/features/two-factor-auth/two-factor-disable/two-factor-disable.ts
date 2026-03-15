import { Component, inject, signal } from '@angular/core';
import { TranslocoDirective, TranslocoService } from '@jsverse/transloco';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { AuthLayout, AuthLayoutTitle } from '../../../shared/components/auth-layout/auth-layout';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ApiService } from '../../../core/services/api.service';
import { RedirectService } from '../../../core/services/redirect.service';
import { TwoFactorDisableConfirmDialog } from './two-factor-disable-confirm.dialog';

interface DisableForm {
  email: FormControl<string>;
  password: FormControl<string>;
  code: FormControl<string>;
}

@Component({
  selector: 'app-two-factor-disable',
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
  templateUrl: './two-factor-disable.html',
  styleUrl: './two-factor-disable.scss',
})
export class TwoFactorDisable {
  readonly emailFC = new FormControl<string>('', {
    validators: [Validators.required, Validators.email],
    nonNullable: true,
  });
  readonly passwordFC = new FormControl<string>('', {
    validators: [Validators.required],
    nonNullable: true,
  });
  readonly codeFC = new FormControl<string>('', {
    validators: [Validators.required, Validators.minLength(6), Validators.maxLength(6)],
    nonNullable: true,
  });

  readonly disableFG = new FormGroup<DisableForm>({
    email: this.emailFC,
    password: this.passwordFC,
    code: this.codeFC,
  });

  private readonly api = inject(ApiService);
  private readonly dialog = inject(MatDialog);
  private readonly redirectService = inject(RedirectService);
  private readonly snackBar = inject(MatSnackBar);
  private readonly transloco = inject(TranslocoService);

  readonly submitting = signal(false);

  onSubmit(): void {
    if (this.disableFG.invalid) {
      this.disableFG.markAllAsTouched();
      return;
    }

    this.dialog
      .open(TwoFactorDisableConfirmDialog)
      .afterClosed()
      .subscribe((confirmed) => {
        if (confirmed) {
          this.disable();
        }
      });
  }

  private disable(): void {
    this.submitting.set(true);
    const { email, password, code } = this.disableFG.getRawValue();

    this.api.disableMfa(email, password, code).subscribe({
      next: () => {
        this.submitting.set(false);
        this.redirectService.complete(
          this.transloco.translate('mfaDisable.successTitle'),
          this.transloco.translate('mfaDisable.successDescription'),
        );
      },
      error: () => {
        this.submitting.set(false);
        this.codeFC.reset();
        this.snackBar.open(
          this.transloco.translate('mfaDisable.errors.serverError'),
          undefined,
          { duration: 5000 },
        );
      },
    });
  }
}
