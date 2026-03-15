import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { TranslocoService } from '@jsverse/transloco';
import { map, Observable } from 'rxjs';
import {
  AccessTokenOutput,
  CheckEmailOutput,
  CheckPasswordStrengthOutput,
  PasswordRulesOutput,
  SetupMultiFactorAuthOutput,
  SignUpOutput,
  VerifyEmailOutput,
  VerifyMultiFactorAuthOutput,
} from '../models/api.models';

export interface SignInOutput {
  exchangeToken: string;
  redirectUrl?: string;
}

@Injectable({ providedIn: 'root' })
export class ApiService {
  private readonly http = inject(HttpClient);
  private readonly transloco = inject(TranslocoService);
  private readonly baseUrl = '/api/v1';

  private get locale(): string {
    return this.transloco.getActiveLang();
  }

  // Sign-in
  signIn(email: string, password: string, rememberMe?: boolean, redirectUrl?: string): Observable<SignInOutput> {
    const body: Record<string, unknown> = { email, password };
    if (rememberMe != null) body['rememberMe'] = rememberMe;
    if (redirectUrl) body['redirectUrl'] = redirectUrl;
    return this.http.post<SignInOutput>(`${this.baseUrl}/sign-in`, body);
  }

  exchange(exchangeToken: string): Observable<AccessTokenOutput> {
    return this.http.post<AccessTokenOutput>(`${this.baseUrl}/sign-in/exchange`, { exchangeToken });
  }

  refreshToken(): Observable<AccessTokenOutput> {
    return this.http.post<AccessTokenOutput>(`${this.baseUrl}/sign-in/refresh`, {});
  }

  requestMagicLink(email: string, rememberMe?: boolean, redirectTo?: string): Observable<void> {
    const body: Record<string, unknown> = { email, locale: this.locale };
    if (rememberMe != null) body['rememberMe'] = rememberMe;
    if (redirectTo) body['redirectTo'] = redirectTo;
    return this.http.post<void>(`${this.baseUrl}/sign-in/magic-link`, body);
  }

  validateMagicLink(sessionId: string, token: string): Observable<SignInOutput> {
    return this.http.post<SignInOutput>(`${this.baseUrl}/sign-in/magic-link/validate`, {
      sessionId,
      token,
    });
  }

  forgotPassword(email: string): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/sign-in/forgot-password`, {
      email,
      locale: this.locale,
    });
  }

  forgotPasswordVerify(email: string, token: string, newPassword: string): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/sign-in/forgot-password/verify`, {
      email,
      token,
      newPassword,
    });
  }

  // Password
  getPasswordRules(): Observable<PasswordRulesOutput> {
    return this.http.get<PasswordRulesOutput>(`${this.baseUrl}/password/rules`);
  }

  checkPasswordStrength(password: string, email?: string): Observable<CheckPasswordStrengthOutput> {
    return this.http.post<CheckPasswordStrengthOutput>(
      `${this.baseUrl}/password/check-strength`,
      email ? { password, email } : { password },
    );
  }

  // Sign-up
  signUp(email: string, password: string): Observable<SignUpOutput> {
    return this.http.post<SignUpOutput>(`${this.baseUrl}/sign-up`, {
      email,
      password,
      locale: this.locale,
    });
  }

  resendVerificationEmail(email: string): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/sign-up/resend-verification-email`, {
      email,
      locale: this.locale,
    });
  }

  checkEmail(email: string): Observable<boolean> {
    const emailAvailableMessage: string =
      'You can continue the registration process if this email is valid.';
    const emailNotAvailableMessage: string = 'If the email can be used, you will be able to sign-up.';

    return this.http
      .post<CheckEmailOutput>(`${this.baseUrl}/sign-up/check-email`, { email })
      .pipe(
        map(({ message }: CheckEmailOutput) => {
          if (message === emailAvailableMessage) {
            return true;
          } else if (message === emailNotAvailableMessage) {
            return false;
          } else {
            throw new Error('Unknown email check message');
          }
        })
      );
  }

  verifyEmail(email: string, token: string): Observable<VerifyEmailOutput> {
    return this.http.post<VerifyEmailOutput>(`${this.baseUrl}/sign-up/verify`, { email, token });
  }

  // Auth
  changePassword(email: string, currentPassword: string, newPassword: string): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/auth/change-password`, {
      email,
      currentPassword,
      newPassword,
    });
  }

  deleteAccount(email: string, password: string): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/auth/delete-account`, {
      email,
      password,
      locale: this.locale,
    });
  }

  verifyDeleteAccount(email: string, token: string): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/auth/delete-account/verify`, { email, token });
  }

  // MFA
  setupMfa(email: string, password: string): Observable<SetupMultiFactorAuthOutput> {
    return this.http.post<SetupMultiFactorAuthOutput>(`${this.baseUrl}/mfa/setup`, {
      email,
      password,
    });
  }

  verifyMfa(email: string, password: string, code: string): Observable<VerifyMultiFactorAuthOutput> {
    return this.http.post<VerifyMultiFactorAuthOutput>(`${this.baseUrl}/mfa/verify`, {
      email,
      password,
      code,
    });
  }

  disableMfa(email: string, password: string, code: string): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/mfa/disable`, { email, password, code });
  }
}
