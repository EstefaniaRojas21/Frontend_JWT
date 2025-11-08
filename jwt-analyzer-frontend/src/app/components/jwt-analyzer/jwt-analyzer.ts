import { Component, EventEmitter, Output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { JwtApi } from '../../services/jwt-api';
import { OutputPanel } from '../output-panel/output-panel';
import { LexicalModal } from '../lexical-modal/lexical-modal'; // ruta correcta


@Component({
  selector: 'jwt-analyzer',
  standalone: true,
  imports: [ CommonModule, FormsModule, OutputPanel, LexicalModal ],
  templateUrl: './jwt-analyzer.html',
  styleUrls: ['./jwt-analyzer.scss']
  
})
export class JwtAnalyzer {
  jwtText = '';                       // enlazado con [(ngModel)]
  loading = signal(false);
  error = signal<string | null>(null);
  analyzedData = signal<any | null>(null);
  showDetails = signal(false);
  showModal = signal(false);
  modalContent = signal<any | null>(null);
  modalTitle = signal("");

  activePhase = signal<'lexico' | 'sintactico' | 'semantico'>('lexico');

  phaseResults = signal<{
    lexico?: any,
    sintactico?: any,
    semantico?: any
  }>({});


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

  analizarFase(fase: 'lexico' | 'sintactico' | 'semantico') {
  const token = this.jwtText?.trim();
  if (!token) {
    this.error.set("Por favor pega un token JWT antes de analizar una fase.");
    return;
  }

  this.loading.set(true);

  this.api.analyzePhase(token, fase).subscribe({
    next: (res) => {
      const current = this.phaseResults();
      this.phaseResults.set({
        ...current,
        [fase]: res
      });

      this.activePhase.set(fase);
      this.showModal.set(true); // abre el modal con datos correctos

      this.loading.set(false);
    },
    error: () => {
      // Si falla, creamos un resultado mínimo para que el modal tenga algo
      const current = this.phaseResults();
      this.phaseResults.set({
        ...current,
        [fase]: { tokens: [], header: {}, payload: {}, errores: [], advertencias: [] }
      });
      this.activePhase.set(fase);
      this.showModal.set(true);
      this.loading.set(false);
      this.error.set("Error al analizar la fase.");
    }
  });
}


cambiarFase(fase: 'lexico' | 'sintactico' | 'semantico') {

  // Cambiar visualmente la pestaña activa
  this.activePhase.set(fase);

  // Si ya existen datos -> no volver a consultar
  if (this.phaseResults()[fase]) {
    return;
  }

  // Si no existen datos -> consultar automáticamente
  const token = this.jwtText?.trim();
  if (!token) {
    this.error.set("No hay token para analizar.");
    return;
  }

  this.loading.set(true);

  this.api.analyzePhase(token, fase).subscribe({
    next: (res) => {
      const current = this.phaseResults();
      this.phaseResults.set({
        ...current,
        [fase]: res
      });

      this.loading.set(false);
    },
    error: () => {
      this.loading.set(false);
      this.error.set("Error al analizar la fase.");
    }
  });
}

// En jwt-analyzer.ts - ACTUALIZA esta función:

onPhaseChanged(fase: 'lexico' | 'sintactico' | 'semantico') {
  this.activePhase.set(fase);

  // Si ya existe resultado -> no llamar API nuevamente
  if (this.phaseResults()[fase]) return;

  // Si no existe -> consultar API
  const token = this.jwtText?.trim();
  if (!token) {
    this.error.set("No hay token para analizar.");
    return;
  }

  this.loading.set(true);
  this.api.analyzePhase(token, fase).subscribe({
    next: (res) => {
      const current = this.phaseResults();
      this.phaseResults.set({ 
        ...current, 
        [fase]: res 
      });
      this.loading.set(false);
    },
    error: (err) => { 
      this.loading.set(false);
      // Crear objeto vacío para que el modal tenga algo que mostrar
      const current = this.phaseResults();
      this.phaseResults.set({
        ...current,
        [fase]: { 
          errores: [`Error al cargar fase ${fase}: ${err?.message || 'Error desconocido'}`],
          tokens: [],
          advertencias: []
        }
      });
    }
  });
}







}
