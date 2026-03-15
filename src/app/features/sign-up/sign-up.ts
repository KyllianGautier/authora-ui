import { Component, inject, signal } from '@angular/core';
import { RedirectService } from '../../core/services/redirect.service';
import { TranslocoDirective, TranslocoService } from '@jsverse/transloco';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AuthLayout, AuthLayoutTitle } from '../../shared/components/auth-layout/auth-layout';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
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
import { catchError, debounceTime, first, map, Observable, of, switchMap } from 'rxjs';
import { ApiService } from '../../core/services/api.service';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { PasswordRules } from '../../shared/components/password-rules/password-rules';

interface SignUpForm {
  email: FormControl<string>;
  password: FormControl<string>;
  confirmPassword: FormControl<string>;
}

@Component({
  selector: 'app-sign-up',
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
  templateUrl: './sign-up.html',
  styleUrl: './sign-up.scss',
})
export class SignUp {
  readonly emailFC: FormControl<string> = new FormControl<string>('', {
    validators: [Validators.required, Validators.email],
    asyncValidators: [this.emailAvailableValidator()],
    nonNullable: true,
  });
  readonly passwordFC: FormControl<string> = new FormControl<string>(
    { value: '', disabled: true },
    {
      validators: [Validators.required],
      asyncValidators: [this.passwordStrengthValidator()],
      nonNullable: true,
    },
  );
  readonly confirmPasswordFC: FormControl<string> = new FormControl<string>(
    { value: '', disabled: true },
    {
      validators: [Validators.required, this.passwordMatchValidator()],
      nonNullable: true,
    },
  );

  readonly signUpFG: FormGroup<SignUpForm> = new FormGroup<SignUpForm>({
    email: this.emailFC,
    password: this.passwordFC,
    confirmPassword: this.confirmPasswordFC,
  });

  private readonly redirectService = inject(RedirectService);
  private readonly snackBar = inject(MatSnackBar);
  private readonly transloco = inject(TranslocoService);

  readonly submitting = signal(false);

  constructor(private readonly _api: ApiService) {
    this.emailFC.statusChanges.subscribe((status) => {
      if (status === 'VALID') {
        this.passwordFC.enable();
        this.confirmPasswordFC.enable();
        this.passwordFC.updateValueAndValidity();
      } else {
        this.passwordFC.disable();
        this.confirmPasswordFC.disable();
      }
    });
    this.passwordFC.valueChanges.subscribe(() => this.confirmPasswordFC.updateValueAndValidity());
  }

  onSubmit(): void {
    if (this.signUpFG.invalid) {
      this.signUpFG.markAllAsTouched();
      return;
    }

    this.submitting.set(true);

    const { email, password } = this.signUpFG.getRawValue();
    this._api.signUp(email, password).subscribe({
      next: () => {
        this.submitting.set(false);
        this.redirectService.complete(
          this.transloco.translate('signUp.successTitle'),
          this.transloco.translate('signUp.successDescription'),
        );
      },
      error: () => {
        this.submitting.set(false);
        this.snackBar.open(this.transloco.translate('signUp.errors.serverError'), undefined, {
          duration: 5000,
        });
      },
    });
  }

  private emailAvailableValidator(): AsyncValidatorFn {
    return (control: AbstractControl<string>): Observable<ValidationErrors | null> => {
      const value = control.value;
      if (!value || control.hasError('required') || control.hasError('email')) {
        return of(null);
      }
      return control.valueChanges.pipe(
        debounceTime(250),
        first(),
        switchMap(() => this._api.checkEmail(control.value)),
        map((available) => (available ? null : { emailAlreadyUsed: true })),
      );
    };
  }

  private passwordStrengthValidator(): AsyncValidatorFn {
    return (control: AbstractControl<string>): Observable<ValidationErrors | null> => {
      const value = control.value;
      if (!value || control.hasError('required') || !this.emailFC.valid) {
        return of(null);
      }
      return control.valueChanges.pipe(
        debounceTime(250),
        first(),
        switchMap(() => this._api.checkPasswordStrength(control.value, this.emailFC.value)),
        map((result) => (result.valid ? null : { passwordWeak: true })),
      );
    };
  }

  private passwordMatchValidator(): ValidatorFn {
    return (control: AbstractControl<string>): ValidationErrors | null => {
      const password = this.signUpFG?.controls.password;
      if (!password || !control.value) {
        return null;
      }
      return control.value === password.value ? null : { passwordMismatch: true };
    };
  }
}
