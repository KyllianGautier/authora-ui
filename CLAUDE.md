# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Authora UI — an Angular 21 application with Angular Material (M2 theme), Transloco i18n, and a signal-based dark/light theme service.

## Commands

- **Dev server:** `npm start` (serves on http://localhost:4200/)
- **Build:** `npm run build` (production) or `npm run watch` (development with watch)
- **Run all tests:** `npm test`
- **Run a single test:** `npx ng test --include=src/app/app.spec.ts`
- **Format code:** `npx prettier --write <file>`

## Architecture

- **Standalone components** — no NgModules. Components are self-contained with their own imports.
- **Angular Signals** for state management (no external state library).
- **Material 2 theming** — palettes defined in `src/styles.scss` using `mat.m2-define-palette()`, light/dark themes via `mat.m2-define-light-theme()` / `mat.m2-define-dark-theme()`. Dark theme scoped under `.dark-theme` class on body.
- **Layout** — `src/app/layout/layout.ts` provides toolbar + sidenav shell with router outlet. ThemeToggle and LangSwitcher live in the toolbar.
- **Feature modules** are lazy-loaded via `loadChildren` in `src/app/app.routes.ts`. Each feature has its own `.routes.ts` file under `src/app/features/<name>/`.
- **ThemeService** (`src/app/core/services/theme.service.ts`) — signal-based, toggles `dark-theme` class on body. Resolution order: localStorage > prefers-color-scheme > light default.
- **i18n with Transloco** — translation files in `public/i18n/{lang}.json`. Language is part of the URL as `:lang` prefix. `langGuard` validates the lang param and syncs it with Transloco.
- **Routing** — all feature routes are nested under `/:lang/` prefix. `langGuard` in `src/app/core/guards/lang.guard.ts` validates supported languages.

## Code Style

- **Prettier** with single quotes, 100 char print width, Angular HTML parser (`.prettierrc`).
- **2-space indentation** (`.editorconfig`).
- **SCSS** for all component and global styles.
- **Strict TypeScript** — strict mode, `strictTemplates`, and `strictInjectionParameters` enabled.
- **Component prefix:** `app` (enforced in `angular.json`).
- Use `*transloco="let t"` directive in templates for translations.

## CI/CD

- GitHub Actions workflow in `.github/workflows/ci.yml` — builds, tests, and publishes to GitHub Packages on push to main/develop.
- `publish.package.json` defines the scoped `@authora/ui` package for GitHub Packages.
