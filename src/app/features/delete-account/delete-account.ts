import { Component, inject, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslocoDirective, TranslocoService } from '@jsverse/transloco';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { AuthLayout, AuthLayoutTitle } from '../../shared/components/auth-layout/auth-layout';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { ApiService } from '../../core/services/api.service';
import { RedirectService } from '../../core/services/redirect.service';
import { DeleteAccountConfirmDialog } from './delete-account-confirm.dialog';

interface DeleteAccountForm {
  email: FormControl<string>;
  password: FormControl<string>;
}

@Component({
  selector: 'app-delete-account',
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
  templateUrl: './delete-account.html',
  styleUrl: './delete-account.scss',
})
export class DeleteAccount {
  private readonly api = inject(ApiService);
  private readonly dialog = inject(MatDialog);
  private readonly redirectService = inject(RedirectService);
  private readonly snackBar = inject(MatSnackBar);
  private readonly transloco = inject(TranslocoService);

  readonly emailFC = new FormControl<string>('', {
    validators: [Validators.required, Validators.email],
    nonNullable: true,
  });
  readonly passwordFC = new FormControl<string>('', {
    validators: [Validators.required],
    nonNullable: true,
  });

  readonly deleteAccountFG = new FormGroup<DeleteAccountForm>({
    email: this.emailFC,
    password: this.passwordFC,
  });

  readonly submitting = signal(false);

  onSubmit(): void {
    if (this.deleteAccountFG.invalid) {
      this.deleteAccountFG.markAllAsTouched();
      return;
    }

    this.dialog
      .open(DeleteAccountConfirmDialog)
      .afterClosed()
      .subscribe((confirmed) => {
        if (confirmed) {
          this.deleteAccount();
        }
      });
  }

  private deleteAccount(): void {
    this.submitting.set(true);
    const { email, password } = this.deleteAccountFG.getRawValue();

    this.api.deleteAccount(email, password).subscribe({
      next: () => {
        this.submitting.set(false);
        this.redirectService.complete(
          this.transloco.translate('deleteAccount.successTitle'),
          this.transloco.translate('deleteAccount.successDescription'),
        );
      },
      error: () => {
        this.submitting.set(false);
        this.passwordFC.reset();
        this.snackBar.open(
          this.transloco.translate('deleteAccount.errors.serverError'),
          undefined,
          { duration: 5000 },
        );
      },
    });
  }
}
