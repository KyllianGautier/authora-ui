import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
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
import { AuthLayout, AuthLayoutTitle } from '../../../shared/components/auth-layout/auth-layout';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { ApiService } from '../../../core/services/api.service';
import { RedirectService } from '../../../core/services/redirect.service';
import { PasswordRules } from '../../../shared/components/password-rules/password-rules';

interface ResetPasswordForm {
  newPassword: FormControl<string>;
  confirmPassword: FormControl<string>;
}

@Component({
  selector: 'app-forgot-password-verify',
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
  templateUrl: './forgot-password-verify.html',
  styleUrl: './forgot-password-verify.scss',
})
export class ForgotPasswordVerify {
  private readonly route = inject(ActivatedRoute);
  private readonly api = inject(ApiService);
  private readonly redirectService = inject(RedirectService);
  private readonly snackBar = inject(MatSnackBar);
  private readonly transloco = inject(TranslocoService);

  readonly email = this.route.snapshot.queryParamMap.get('email') ?? '';
  private readonly token = this.route.snapshot.queryParamMap.get('token') ?? '';

  readonly newPasswordFC = new FormControl<string>('', {
    validators: [Validators.required],
    asyncValidators: [this.passwordStrengthValidator()],
    nonNullable: true,
  });
  readonly confirmPasswordFC = new FormControl<string>('', {
    validators: [Validators.required, this.passwordMatchValidator()],
    nonNullable: true,
  });

  readonly resetFG = new FormGroup<ResetPasswordForm>({
    newPassword: this.newPasswordFC,
    confirmPassword: this.confirmPasswordFC,
  });

  readonly submitting = signal(false);
  readonly invalidLink = !this.email || !this.token;

  constructor() {
    this.redirectService.init();
    this.newPasswordFC.valueChanges.subscribe(() =>
      this.confirmPasswordFC.updateValueAndValidity()
    );
  }

  onSubmit(): void {
    if (this.resetFG.invalid) {
      this.resetFG.markAllAsTouched();
      return;
    }

    this.submitting.set(true);

    this.api.forgotPasswordVerify(this.email, this.token, this.newPasswordFC.value).subscribe({
      next: () => {
        this.submitting.set(false);
        this.redirectService.complete(
          this.transloco.translate('forgotPasswordVerify.successTitle'),
          this.transloco.translate('forgotPasswordVerify.successDescription'),
        );
      },
      error: () => {
        this.submitting.set(false);
        this.snackBar.open(
          this.transloco.translate('forgotPasswordVerify.errors.serverError'),
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
          this.api.checkPasswordStrength(control.value, this.email || undefined)
        ),
        map((result) => (result.valid ? null : { passwordWeak: true })),
      );
    };
  }

  private passwordMatchValidator(): ValidatorFn {
    return (control: AbstractControl<string>): ValidationErrors | null => {
      const password = this.resetFG?.controls.newPassword;
      if (!password || !control.value) {
        return null;
      }
      return control.value === password.value ? null : { passwordMismatch: true };
    };
  }
}
