import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { DsBadge } from '@convo/ds';
import { Issue } from './studio.models';

export interface PublishData {
  readonly agent: string;
  readonly nextVersion: number;
  readonly issues: readonly Issue[];
}

@Component({
  selector: 'app-publish-dialog',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatDialogModule, MatButtonModule, DsBadge],
  template: `
    <h2 mat-dialog-title>Publish {{ data.agent }} as v{{ data.nextVersion }}?</h2>
    <mat-dialog-content>
      @if (data.issues.length) {
        <p>Pre-flight found {{ data.issues.length }} {{ data.issues.length === 1 ? 'item' : 'items' }}:</p>
        <ul>
          @for (i of data.issues; track $index) {
            <li><ds-badge [tone]="i.level === 'error' ? 'crit' : 'warn'">{{ i.level }}</ds-badge> {{ i.message }}</li>
          }
        </ul>
      } @else {
        <p>All pre-flight checks passed. Live conversations will switch to the new version on their next turn.</p>
      }
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close>Cancel</button>
      <button mat-flat-button [mat-dialog-close]="true" cdkFocusInitial>Publish v{{ data.nextVersion }}</button>
    </mat-dialog-actions>
  `,
  styles: `ul { list-style: none; padding: 0; display: flex; flex-direction: column; gap: 8px; font-size: var(--fs-sm); }`,
})
export class PublishDialog {
  protected readonly data = inject<PublishData>(MAT_DIALOG_DATA);
}
