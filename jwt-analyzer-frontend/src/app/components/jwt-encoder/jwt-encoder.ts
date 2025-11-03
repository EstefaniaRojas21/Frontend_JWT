import { Component, EventEmitter, Output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { JwtApi } from '../../services/jwt-api';

@Component({
  selector: 'jwt-encoder',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './jwt-encoder.html',
  styleUrls: ['./jwt-encoder.scss']
})
export class JwtEncoder {
  // Campos del formulario
  payloadText = '{"sub":"123","name":"Alice"}';
  secretText = '';
  algorithm = 'HS256';
  expiration?: number;

  // Estado
  loading = signal(false);
  error = signal<string | null>(null);
  result = signal<string | null>(null);

  @Output() tokenGenerated = new EventEmitter<string>();

  constructor(private api: JwtApi) {}

  // Generar token usando API real
  generate() {
    this.error.set(null);
    this.result.set(null);

    // Validar payload JSON
    let payloadObj: any;
    try {
      payloadObj = JSON.parse(this.payloadText);
    } catch {
      this.error.set('Payload JSON inválido.');
      return;
    }

    // Validar secret
    if (!this.secretText?.trim()) {
      this.error.set('Ingresa una clave secreta para codificar.');
      return;
    }

    this.loading.set(true);
    this.api.encode(payloadObj, this.secretText.trim(), this.algorithm, this.expiration).subscribe({
      next: (res: any) => {
        this.loading.set(false);
        if (res?.success && res.jwt) {
          this.result.set(res.jwt);
          this.tokenGenerated.emit(res.jwt);
        } else if (typeof res === 'string') {
          // Por si el endpoint devuelve directamente el JWT como string
          this.result.set(res);
          this.tokenGenerated.emit(res);
        } else {
          this.error.set(res?.error ?? 'Respuesta inválida del servidor.');
        }
      },
      error: (err: any) => {
        this.loading.set(false);
        this.error.set(err?.error?.error ?? err?.message ?? 'Error al codificar.');
      }
    });
  }

  // Copiar token al portapapeles
  copyToClipboard(text: string) {
    if (!text) {
      alert('No hay token para copiar.');
      return;
    }
    if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(text).then(() => alert('Token copiado ✅'))
        .catch(() => this.fallbackCopy(text));
      return;
    }
    this.fallbackCopy(text);
  }

  private fallbackCopy(text: string) {
    try {
      const ta = document.createElement('textarea');
      ta.value = text;
      ta.style.position = 'fixed';
      ta.style.left = '-9999px';
      document.body.appendChild(ta);
      ta.select();
      // @ts-ignore: execCommand usado solo como fallback
      document.execCommand('copy');
      document.body.removeChild(ta);
      alert('Token copiado ✅');
    } catch {
      alert('No se pudo copiar automáticamente. Selecciona y copia manualmente.');
    }
  }

  // Limpiar formulario
  clearForm() {
    this.payloadText = '{"sub":"123","name":"Alice"}';
    this.secretText = '';
    this.algorithm = 'HS256';
    this.expiration = undefined;
    this.error.set(null);
    this.result.set(null);
    this.loading.set(false);
  }
}
