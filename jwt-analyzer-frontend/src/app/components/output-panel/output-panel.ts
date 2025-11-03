// src/app/components/output-panel/output-panel.ts
import { Component, Input } from '@angular/core';
import { CommonModule, JsonPipe } from '@angular/common';

@Component({
  selector: 'app-output-panel',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="output-card">
      <h4 *ngIf="title">{{ title }}</h4>
      <div *ngIf="!data" class="muted">No hay datos para mostrar.</div>
      <pre *ngIf="data" class="json-block">{{ data | json }}</pre>
      <div class="row" *ngIf="data">
        <button class="btn small" (click)="copy()">Copiar JSON</button>
      </div>
    </div>
  `,
  styles: [`
    .muted { color: #6b7280; }
    .json-block { background:#0f172a; color:#e6eef8; padding:12px; border-radius:6px; font-family: monospace; max-height:380px; overflow:auto; }
    .output-card { padding:12px; }
    .row { margin-top:8px; }
  `]
})
export class OutputPanel {
  @Input() data: any = null;
  @Input() title?: string;

  copy() {
    const text = (this.data) ? JSON.stringify(this.data, null, 2) : '';
    if (!text) return;
    if (navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(text).catch(() => this.fallback(text));
    } else {
      this.fallback(text);
    }
  }

  private fallback(text: string) {
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.style.position = 'fixed';
    ta.style.left = '-9999px';
    document.body.appendChild(ta);
    ta.select();
    try { document.execCommand('copy'); } catch {}
    document.body.removeChild(ta);
  }
}
