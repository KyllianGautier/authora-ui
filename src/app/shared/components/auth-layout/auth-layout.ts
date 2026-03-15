import { Component, Directive, inject } from '@angular/core';
import { MatIconButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { ThemeToggle } from '../theme-toggle/theme-toggle';
import { LangSwitcher } from '../lang-switcher/lang-switcher';
import { BackToPageService } from '../../../core/services/back-to-page.service';

@Directive({ selector: '[authLayoutTitle]' })
export class AuthLayoutTitle {}

@Component({
  selector: 'app-auth-layout',
  imports: [MatIconButton, MatIcon, ThemeToggle, LangSwitcher],
  templateUrl: './auth-layout.html',
  styleUrl: './auth-layout.scss',
})
export class AuthLayout {
  readonly backToPageService = inject(BackToPageService);
}
