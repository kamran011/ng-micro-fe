import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { DsBadge, DsEmpty, DsSparkline, DsStat, Tone } from '@convo/ds';

interface Swatch { token: string; label: string }
interface Api { name: string; type: string; def: string; desc: string }

@Component({
  selector: 'app-design-system-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatButtonModule, MatFormFieldModule, MatInputModule, MatSlideToggleModule, DsBadge, DsEmpty, DsSparkline, DsStat],
  templateUrl: './design-system-page.html',
  styleUrl: './design-system-page.scss',
})
export class DesignSystemPage {
  protected readonly surfaces: Swatch[] = [
    { token: '--bg', label: 'Canvas' }, { token: '--surface', label: 'Surface' }, { token: '--surface-2', label: 'Surface 2' },
    { token: '--surface-3', label: 'Surface 3' }, { token: '--line', label: 'Line' }, { token: '--ink', label: 'Ink' },
    { token: '--ink-2', label: 'Ink 2' }, { token: '--ink-3', label: 'Ink 3' },
  ];
  protected readonly semantic: Swatch[] = [
    { token: '--accent', label: 'Accent' }, { token: '--ok', label: 'OK' }, { token: '--warn', label: 'Warn' },
    { token: '--crit', label: 'Critical' }, { token: '--info', label: 'Info' },
  ];
  protected readonly charts: Swatch[] = [1, 2, 3, 4].map((n) => ({ token: `--chart-${n}`, label: `Series ${n}` }));
  protected readonly type = [
    { token: '--fs-2xl', sample: 'Display 2,481' }, { token: '--fs-xl', sample: 'Page title' }, { token: '--fs-lg', sample: 'Section heading' },
    { token: '--fs-md', sample: 'Body text for reading and forms' }, { token: '--fs-sm', sample: 'Dense table and secondary text' }, { token: '--fs-xs', sample: 'CAPTION · META' },
  ];
  protected readonly tones: Tone[] = ['neutral', 'ok', 'warn', 'crit', 'info', 'accent'];
  protected readonly spark = [3, 5, 4, 7, 6, 9, 8, 12, 10, 14];
  protected readonly badgeApi: Api[] = [{ name: 'tone', type: "'neutral'|'ok'|'warn'|'crit'|'info'|'accent'", def: "'neutral'", desc: 'Semantic colour. A glyph always accompanies the colour.' }];
  protected readonly statApi: Api[] = [
    { name: 'label', type: 'string', def: 'required', desc: 'Short uppercase caption.' },
    { name: 'value', type: 'string | number', def: 'required', desc: 'Primary figure, tabular numerals.' },
    { name: 'unit', type: 'string', def: "''", desc: 'Unit suffix.' },
    { name: 'delta', type: 'string', def: "''", desc: 'Change vs. a baseline.' },
    { name: 'trend', type: "'good'|'bad'|'flat'", def: "'flat'", desc: 'Colours the delta.' },
    { name: 'spark', type: 'number[] | null', def: 'null', desc: 'Optional trend line.' },
  ];
  protected readonly chartApi: Api[] = [
    { name: 'option', type: 'EChartsOption', def: 'required', desc: 'Series and axes. Theme, grid and tooltip come from tokens.' },
    { name: 'label', type: 'string', def: 'required', desc: 'Accessible name for the canvas (role="img").' },
    { name: 'summary', type: 'string', def: "''", desc: 'Text equivalent of the data, read after the label.' },
  ];
}
