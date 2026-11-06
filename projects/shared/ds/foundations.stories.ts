import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { moduleMetadata, type Meta, type StoryObj } from '@storybook/angular';

const SURFACES = ['--bg', '--surface', '--surface-2', '--surface-3', '--line', '--ink', '--ink-2', '--ink-3'];
const SEMANTIC = ['--accent', '--ok', '--warn', '--crit', '--info', '--chart-1', '--chart-2', '--chart-3', '--chart-4'];

@Component({
  selector: 'sb-swatches',
  template: `
    @for (group of groups; track group.name) {
      <h3 style="margin:16px 0 8px">{{ group.name }}</h3>
      <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(120px,1fr));gap:12px">
        @for (t of group.tokens; track t) {
          <figure style="margin:0">
            <div [style.background]="'var(' + t + ')'" style="height:48px;border-radius:6px;border:1px solid var(--line-strong)"></div>
            <figcaption class="mono" style="font-size:12px;color:var(--ink-3);margin-top:4px">{{ t }}</figcaption>
          </figure>
        }
      </div>
    }
  `,
})
class Swatches {
  groups = [{ name: 'Surfaces & ink', tokens: SURFACES }, { name: 'Semantic & chart', tokens: SEMANTIC }];
}

@Component({
  selector: 'sb-type',
  template: `
    @for (t of scale; track t[0]) {
      <div style="display:flex;gap:16px;align-items:baseline;padding:6px 0;border-bottom:1px solid var(--line)">
        <code style="width:90px;color:var(--ink-3)">{{ t[0] }}</code>
        <span [style.font-size]="'var(' + t[0] + ')'">{{ t[1] }}</span>
      </div>
    }
    <p class="num" style="font-size:var(--fs-xl);margin-top:16px">1,234,567.89</p>
  `,
})
class TypeScale {
  scale = [['--fs-2xl', 'Display 2,481'], ['--fs-xl', 'Page title'], ['--fs-lg', 'Section heading'], ['--fs-md', 'Body text for reading and forms'], ['--fs-sm', 'Dense table and secondary text'], ['--fs-xs', 'CAPTION · META']];
}

const meta: Meta = {
  title: 'Foundations/Tokens',
  decorators: [moduleMetadata({ imports: [Swatches, TypeScale, MatButtonModule, MatFormFieldModule, MatInputModule, MatSlideToggleModule, MatButtonToggleModule] })],
};
export default meta;
type Story = StoryObj;

export const Colour: Story = { render: () => ({ template: `<sb-swatches />` }) };
export const Typography: Story = { render: () => ({ template: `<sb-type />` }) };

export const MaterialThemed: Story = {
  name: 'Material, themed',
  render: () => ({
    template: `
      <div style="display:flex;gap:12px;align-items:center;flex-wrap:wrap">
        <button mat-flat-button>Primary</button>
        <button mat-stroked-button>Secondary</button>
        <button mat-button>Tertiary</button>
        <button mat-flat-button disabled>Disabled</button>
        <mat-button-toggle-group value="5m" aria-label="Range" hideSingleSelectionIndicator>
          <mat-button-toggle value="1m">1m</mat-button-toggle>
          <mat-button-toggle value="5m">5m</mat-button-toggle>
          <mat-button-toggle value="15m">15m</mat-button-toggle>
        </mat-button-toggle-group>
        <mat-form-field appearance="outline"><mat-label>Field</mat-label><input matInput value="Value" /></mat-form-field>
        <mat-slide-toggle checked>Toggle</mat-slide-toggle>
      </div>`,
  }),
};
