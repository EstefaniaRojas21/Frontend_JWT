import { Component, EventEmitter, Output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { JwtApi } from '../../services/jwt-api';
import { OutputPanel } from '../output-panel/output-panel';
import { LexicalModal } from '../lexical-modal/lexical-modal';
import Swal from 'sweetalert2';


@Component({
  selector: 'jwt-analyzer',
  standalone: true,
  imports: [ CommonModule, FormsModule, OutputPanel, LexicalModal ],
  templateUrl: './jwt-analyzer.html',
  styleUrls: ['./jwt-analyzer.scss']
})
export class JwtAnalyzer {
  jwtText = '';
  loading = signal(false);
  error = signal<string | null>(null);
  analyzedData = signal<any | null>(null);
  showDetails = signal(false);
  showModal = signal(false);

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
        

        this.phaseResults.set({
          lexico: res,  // El análisis completo incluye todo lo léxico
          sintactico: res.sintactico,
          semantico: res.semantico
        });
        
       // this.tokenAnalyzed.emit(res);
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
    Swal.fire({
      icon: 'warning',
      title: 'Token faltante',
      text: 'Por favor pega un token JWT antes de validar.',
      confirmButtonColor: '#3085d6'
    });
    return;
  }

  const secretInput: HTMLInputElement | null = document.querySelector("#secretInput");
  const secret = secretInput?.value.trim() || "";

  if (!secret) {
    Swal.fire({
      icon: 'warning',
      title: 'Clave secreta requerida',
      text: 'Debes ingresar una clave secreta para validar la firma.',
      confirmButtonColor: '#3085d6'
    });
    return;
  }

  this.loading.set(true);

  this.api.verify_signature(token, secret).subscribe({
    next: (res: any) => {
      this.loading.set(false);

      if (res.success) {
        Swal.fire({
          icon: 'success',
          title: 'Firma válida',
          text: 'La firma es válida.',
          confirmButtonColor: '#28a745'
        });
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Firma inválida',
          text: 'La firma del token no coincide con la clave secreta.',
          confirmButtonColor: '#d33'
        });
      }
    },
    error: () => {
      this.loading.set(false);
      Swal.fire({
        icon: 'error',
        title: 'Error en el servidor',
        text: 'No se pudo validar la firma.',
        confirmButtonColor: '#d33'
      });
    }
  });
}



  clear() {
    this.jwtText = '';
    this.error.set(null);
    this.analyzedData.set(null);
    this.phaseResults.set({});
  }

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

    // Si ya existe analyzedData (análisis completo previo), usar esos datos
    const currentData = this.analyzedData();
    if (currentData) {
      // Usar datos ya existentes
      this.activePhase.set(fase);
      
      if (fase === 'lexico') {
        // Para léxico, usamos el análisis completo que ya tiene el reporte
        this.phaseResults.update(current => ({
          ...current,
          lexico: currentData
        }));
      } else if (fase === 'sintactico') {
        this.phaseResults.update(current => ({
          ...current,
          sintactico: currentData.sintactico
        }));
      } else if (fase === 'semantico') {
        this.phaseResults.update(current => ({
          ...current,
          semantico: currentData.semantico
        }));
      }
      
      this.showModal.set(true);
      return;
    }

    // Si no hay datos previos, hacer análisis completo primero
    this.loading.set(true);
    this.api.analyze(token).subscribe({
      next: (res: any) => {
        this.analyzedData.set(res);
        
        // Guardar todos los datos
        this.phaseResults.set({
          lexico: res,
          sintactico: res.sintactico,
          semantico: res.semantico
        });
        
        this.activePhase.set(fase);
        this.showModal.set(true);
        this.loading.set(false);
      },
      error: (err) => {
        this.loading.set(false);
        this.error.set(`Error al analizar: ${err?.message || 'Error desconocido'}`);
      }
    });
  }

  onPhaseChanged(fase: 'lexico' | 'sintactico' | 'semantico') {
    this.activePhase.set(fase);

    // Si ya existe resultado para esa fase, no hacer nada más
    if (this.phaseResults()[fase]) return;

    // Si no existe, obtener del analyzedData si está disponible
    const currentData = this.analyzedData();
    if (currentData) {
      if (fase === 'lexico') {
        this.phaseResults.update(current => ({
          ...current,
          lexico: currentData
        }));
      } else if (fase === 'sintactico') {
        this.phaseResults.update(current => ({
          ...current,
          sintactico: currentData.sintactico
        }));
      } else if (fase === 'semantico') {
        this.phaseResults.update(current => ({
          ...current,
          semantico: currentData.semantico
        }));
      }
      return;
    }

    // Si no hay datos, mostrar error
    this.error.set("Primero debes analizar el token completo.");
  }
}