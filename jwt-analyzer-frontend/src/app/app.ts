// src/app/app.ts
import { Component, ViewChild, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
import { OutputPanel } from './components/output-panel/output-panel';
import { JwtAnalyzer } from './components/jwt-analyzer/jwt-analyzer';
import { JwtEncoder } from './components/jwt-encoder/jwt-encoder';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, HttpClientModule, JwtAnalyzer, JwtEncoder, OutputPanel],
  templateUrl: './app.html',
  styleUrls: ['./app.scss']
})
export class App {

  decodedPayload: any = null;
  readonly title = signal('JWT Analyzer');
  readonly analyzedData = signal<any | null>(null);
  readonly generatedToken = signal('');
  readonly showDetails = signal(false); // toggle panel detalles

  // Referencias a hijos
  @ViewChild(JwtAnalyzer) analyzer!: JwtAnalyzer;
  @ViewChild(JwtEncoder) encoder!: JwtEncoder;
  onTokenAnalyzed(data: any) {
  console.log('Token Analizado:', data);

  this.analyzedData.set(data);


    if (data?.payload_decodificado) {
      this.decodedPayload = data.payload_decodificado;
    }
  }

  onTokenGenerated(token: string) {
    console.log('Token Generado:', token);
    this.generatedToken.set(token);
  }

  // Copiar token al portapapeles con fallback
  copyToken(): void {
    const token = this.generatedToken();
    if (!token) {
      alert('No hay token para copiar.');
      return;
    }
    if (navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(token).catch(() => this.fallbackCopyText(token));
      return;
    }
    this.fallbackCopyText(token);
  }

  private fallbackCopyText(text: string) {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.left = '-9999px';
    document.body.appendChild(textarea);
    textarea.select();
    try { document.execCommand('copy'); } catch {}
    document.body.removeChild(textarea);
  }

  // Botón "Limpiar Todo"
  onClearAll() {
    console.log('Limpiando todos los formularios...');

    // Limpiar Analyzer
    this.analyzer?.clear();

    // Limpiar Encoder
    this.encoder?.clearForm();

    // Limpiar panel de salida detallada
    const output = document.getElementById('outputDetail');
    if (output) output.textContent = '';

    // Limpiar señales
    this.analyzedData.set(null);
    this.generatedToken.set('');
    this.showDetails.set(false);
  }
}
