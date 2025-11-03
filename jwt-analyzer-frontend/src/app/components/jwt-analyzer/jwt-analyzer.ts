import { Component, EventEmitter, Output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { JwtApi } from '../../services/jwt-api';
import { OutputPanel } from '../output-panel/output-panel';

@Component({
  selector: 'jwt-analyzer',
  standalone: true,
  imports: [CommonModule, FormsModule, OutputPanel],
  templateUrl: './jwt-analyzer.html',
  styleUrls: ['./jwt-analyzer.scss']
})
export class JwtAnalyzer {
  jwtText = '';                       // enlazado con [(ngModel)]
  loading = signal(false);
  error = signal<string | null>(null);
  analyzedData = signal<any | null>(null);
  showDetails = signal(false);

  @Output() tokenAnalyzed = new EventEmitter<any>();

  constructor(private api: JwtApi) {}

  analizarToken() {
    const token = this.jwtText?.trim();
    if (!token) {
      this.error.set('Por favor pega un token JWT antes de analizar.');
      return;
    }

    this.error.set(null);
    this.loading.set(true);

    this.api.analyze(token).subscribe({
      next: (res: any) => {
        console.log('Respuesta API completa:', res);
        this.analyzedData.set(res);
        this.tokenAnalyzed.emit(res);
        this.loading.set(false);
      },
      error: (err: any) => {
        const msg = err?.error?.error ?? err?.message ?? 'Error al analizar';
        this.error.set(msg);
        this.loading.set(false);
      }
    });
  }

  validarFirma() {
    const token = this.jwtText?.trim();
    if (!token) {
      alert('Por favor pega un token JWT antes de validar.');
      return;
    }

    this.loading.set(true);
    this.api.validate(token).subscribe({
      next: (res: any) => {
        this.loading.set(false);
        if (res?.success) {
          alert('Firma válida ✅');
        } else {
          alert('Resultado: ' + (res?.error ?? JSON.stringify(res)));
        }
      },
      error: (err: any) => {
        this.loading.set(false);
        alert('Firma inválida ❌');
      }
    });
  }

  clear() {
    this.jwtText = '';
    this.error.set(null);
    this.analyzedData.set(null);
  }

  // Genera un resumen del JWT para mostrar en el panel azul
  get analyzedSummary() {
    const data = this.analyzedData();
    if (!data) return null;

    return {
      sub: data.payload_decodificado?.sub,
      name: data.payload_decodificado?.name,
      validSignature: data.sintactico?.valido ?? null
    };
  }




}
