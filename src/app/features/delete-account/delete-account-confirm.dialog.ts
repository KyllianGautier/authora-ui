import { Component } from '@angular/core';
import {
  MatDialogActions,
  MatDialogClose,
  MatDialogContent,
  MatDialogTitle,
} from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { TranslocoDirective } from '@jsverse/transloco';

@Component({
  selector: 'app-delete-account-confirm-dialog',
  imports: [
    MatDialogTitle,
    MatDialogContent,
    MatDialogActions,
    MatDialogClose,
    MatButtonModule,
    TranslocoDirective,
  ],
  template: `
    <div *transloco="let t">
      <h2 mat-dialog-title>{{ t('deleteAccount.confirm.title') }}</h2>
      <mat-dialog-content>
        <p>{{ t('deleteAccount.confirm.message') }}</p>
      </mat-dialog-content>
      <mat-dialog-actions align="end">
        <button mat-button [mat-dialog-close]="false">{{ t('deleteAccount.confirm.no') }}</button>
        <button mat-flat-button color="warn" [mat-dialog-close]="true">
          {{ t('deleteAccount.confirm.yes') }}
        </button>
      </mat-dialog-actions>
    </div>
  `,
})
export class DeleteAccountConfirmDialog {}
