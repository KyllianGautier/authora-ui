import { Component, inject, signal } from '@angular/core';
import {
  AbstractControl,
  AsyncValidatorFn,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  ValidationErrors,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import { debounceTime, first, map, Observable, of, switchMap } from 'rxjs';
import { TranslocoDirective, TranslocoService } from '@jsverse/transloco';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AuthLayout, AuthLayoutTitle } from '../../shared/components/auth-layout/auth-layout';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { ApiService } from '../../core/services/api.service';
import { RedirectService } from '../../core/services/redirect.service';
import { PasswordRules } from '../../shared/components/password-rules/password-rules';

interface ChangePasswordForm {
  email: FormControl<string>;
  currentPassword: FormControl<string>;
  newPassword: FormControl<string>;
  confirmPassword: FormControl<string>;
}

@Component({
  selector: 'app-change-password',
  imports: [
    ReactiveFormsModule,
    TranslocoDirective,
    AuthLayout,
    AuthLayoutTitle,
    MatFormFieldModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    PasswordRules,
  ],
  templateUrl: './change-password.html',
  styleUrl: './change-password.scss',
})
export class ChangePassword {
  private readonly api = inject(ApiService);
  private readonly redirectService = inject(RedirectService);
  private readonly snackBar = inject(MatSnackBar);
  private readonly transloco = inject(TranslocoService);

  readonly emailFC = new FormControl<string>('', {
    validators: [Validators.required, Validators.email],
    nonNullable: true,
  });
  readonly currentPasswordFC = new FormControl<string>('', {
    validators: [Validators.required],
    nonNullable: true,
  });
  readonly newPasswordFC = new FormControl<string>(
    { value: '', disabled: true },
    {
      validators: [Validators.required],
      asyncValidators: [this.passwordStrengthValidator()],
      nonNullable: true,
    },
  );
  readonly confirmPasswordFC = new FormControl<string>(
    { value: '', disabled: true },
    {
      validators: [Validators.required, this.passwordMatchValidator()],
      nonNullable: true,
    },
  );

  readonly changePasswordFG = new FormGroup<ChangePasswordForm>({
    email: this.emailFC,
    currentPassword: this.currentPasswordFC,
    newPassword: this.newPasswordFC,
    confirmPassword: this.confirmPasswordFC,
  });

  readonly submitting = signal(false);

  constructor() {
    this.emailFC.statusChanges.subscribe((status) => {
      if (status === 'VALID') {
        this.newPasswordFC.enable();
        this.confirmPasswordFC.enable();
        this.newPasswordFC.updateValueAndValidity();
      } else {
        this.newPasswordFC.disable();
        this.confirmPasswordFC.disable();
      }
    });
    this.newPasswordFC.valueChanges.subscribe(() =>
      this.confirmPasswordFC.updateValueAndValidity(),
    );
  }

  onSubmit(): void {
    if (this.changePasswordFG.invalid) {
      this.changePasswordFG.markAllAsTouched();
      return;
    }

    this.submitting.set(true);

    const { email, currentPassword, newPassword } = this.changePasswordFG.getRawValue();
    this.api.changePassword(email, currentPassword, newPassword).subscribe({
      next: () => {
        this.submitting.set(false);
        this.redirectService.complete(
          this.transloco.translate('changePassword.successTitle'),
          this.transloco.translate('changePassword.successDescription'),
        );
      },
      error: () => {
        this.submitting.set(false);
        this.snackBar.open(
          this.transloco.translate('changePassword.errors.serverError'),
          undefined,
          { duration: 5000 },
        );
      },
    });
  }

  private passwordStrengthValidator(): AsyncValidatorFn {
    return (control: AbstractControl<string>): Observable<ValidationErrors | null> => {
      const value = control.value;
      if (!value || control.hasError('required')) {
        return of(null);
      }
      return control.valueChanges.pipe(
        debounceTime(250),
        first(),
        switchMap(() =>
          this.api.checkPasswordStrength(control.value, this.emailFC.value || undefined),
        ),
        map((result) => (result.valid ? null : { passwordWeak: true })),
      );
    };
  }

  private passwordMatchValidator(): ValidatorFn {
    return (control: AbstractControl<string>): ValidationErrors | null => {
      const password = this.changePasswordFG?.controls.newPassword;
      if (!password || !control.value) {
        return null;
      }
      return control.value === password.value ? null : { passwordMismatch: true };
    };
  }
}
