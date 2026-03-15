import { Component, computed, effect, inject, input, signal, Signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { MatIcon } from '@angular/material/icon';
import { TranslocoDirective } from '@jsverse/transloco';
import { Subject, debounceTime, switchMap, of, catchError } from 'rxjs';
import { ApiService } from '../../../core/services/api.service';
import { CheckPasswordStrengthOutput, PasswordRulesOutput } from '../../../core/models/api.models';

interface RuleCheck {
  key: string;
  passed: boolean;
}

interface RuleDefinition {
  key: string;
  isActive: (rules: PasswordRulesOutput) => boolean;
  errorMessage: string;
}

const RULE_DEFINITIONS: RuleDefinition[] = [
  {
    key: 'minLength',
    isActive: () => true,
    errorMessage: 'Password must contain at least',
  },
  {
    key: 'hasLowercase',
    isActive: (r) => r.requireLowercase,
    errorMessage: 'Password must contain at least one lowercase letter',
  },
  {
    key: 'hasUppercase',
    isActive: (r) => r.requireUppercase,
    errorMessage: 'Password must contain at least one uppercase letter',
  },
  {
    key: 'hasDigit',
    isActive: (r) => r.requireDigit,
    errorMessage: 'Password must contain at least one digit',
  },
  {
    key: 'hasSpecialChar',
    isActive: (r) => r.requireSpecialChar,
    errorMessage: 'Password must contain at least one special character',
  },
  {
    key: 'noSequentialChars',
    isActive: (r) => r.forbidSequentialChars,
    errorMessage: 'Password must not contain sequential characters',
  },
  {
    key: 'noRepeatedChars',
    isActive: (r) => r.forbidRepeatedChars,
    errorMessage: 'Password must not contain repeated characters',
  },
  {
    key: 'noKeyboardSequence',
    isActive: (r) => r.forbidKeyboardSequence,
    errorMessage: 'Password must not contain keyboard sequences',
  },
  {
    key: 'noUserInfo',
    isActive: (r) => r.forbidUserInfo,
    errorMessage: 'Password must not contain user info',
  },
  {
    key: 'noCommonPassword',
    isActive: (r) => r.forbidCommonPassword,
    errorMessage: 'Password must not be a commonly used password',
  },
];

@Component({
  selector: 'app-password-rules',
  imports: [MatIcon, TranslocoDirective],
  templateUrl: './password-rules.html',
  styleUrl: './password-rules.scss',
})
export class PasswordRules {
  private readonly api = inject(ApiService);
  private readonly check$ = new Subject<{ password: string; email: string }>();

  readonly password = input<string>('');
  readonly email = input<string>('');
  readonly rules: Signal<PasswordRulesOutput | undefined> = toSignal(this.api.getPasswordRules());

  private readonly strengthResult = toSignal(
    this.check$.pipe(
      debounceTime(250),
      switchMap(({ password, email }) =>
        password
          ? this.api.checkPasswordStrength(password, email || undefined).pipe(
              catchError(() => of({ valid: false, errors: [] } as CheckPasswordStrengthOutput))
            )
          : of(null)
      )
    )
  );

  readonly activeRules = computed(() => {
    const rules = this.rules();
    if (!rules) return [];
    return RULE_DEFINITIONS.filter((def) => def.isActive(rules));
  });

  readonly results = computed<RuleCheck[]>(() => {
    const active = this.activeRules();
    const pw = this.password();
    const result = this.strengthResult();

    if (!pw || !result) {
      return active.map((def) => ({ key: def.key, passed: false }));
    }

    const errors = result.errors ?? [];
    return active.map((def) => ({
      key: def.key,
      passed: !errors.some((err) => err.includes(def.errorMessage)),
    }));
  });

  constructor() {
    effect(() => {
      this.check$.next({ password: this.password(), email: this.email() });
    });
  }
}
