import { Component, EventEmitter, Output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { JwtApi, JwtHistoryItem  } from '../../services/jwt-api';
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
  header = signal<any | null>(null);
  payload = signal<any | null>(null);
  signatureValid = signal<boolean>(false);
  showHistory = signal(false);
  historyData = signal<JwtHistoryItem[]>([]);


  activePhase = signal<'lexico' | 'sintactico' | 'semantico'>('lexico');

  phaseResults = signal<{
    lexico?: any,
    sintactico?: any,
    semantico?: any
  }>({});

  @Output() tokenAnalyzed = new EventEmitter<any>();
  

  constructor(private api: JwtApi) {}

  // Método para cargar historial
  toggleHistory() {
    if (!this.showHistory()) {
      this.api.getHistory().subscribe({
        next: (res) => {
          if (res.success) {
            this.historyData.set(res.data);
          } else {
            Swal.fire({
              icon: 'error',
              title: 'Error al obtener historial',
              text: 'Error desconocido'
            });
          }
        },
        error: (err) => {
          Swal.fire({
            icon: 'error',
            title: 'Error en el servidor',
            text: err.message || 'No se pudo cargar el historial'
          });
        }
      });
    }
    this.showHistory.set(!this.showHistory());
  }

  // Método para copiar token
  copyToClipboard(token: string) {
    navigator.clipboard.writeText(token).then(() => {
      Swal.fire({
        icon: 'success',
        title: 'Copiado',
        text: 'Token copiado al portapapeles',
        timer: 1200,
        showConfirmButton: false
      });
    });
  }


  validarTokenFront(token: string): { ok: boolean; error?: string } {
    if (!token || token.trim().length === 0) {
      return { ok: false, error: "El token está vacío." };
    }

    const partes = token.split(".");
    if (partes.length !== 3) {
      return {
        ok: false,
        error: "El token JWT debe tener 3 partes: header.payload.signature",
      };
    }

    const [header, payload, signature] = partes;

    if (!header) return { ok: false, error: "La sección HEADER está vacía." };
    if (!payload) return { ok: false, error: "La sección PAYLOAD está vacía." };
    if (!signature) return { ok: false, error: "La sección SIGNATURE está vacía." };

    const base64urlRegex = /^[A-Za-z0-9\-_]+$/;

    if (!base64urlRegex.test(header)) {
      return {
        ok: false,
        error: "El HEADER contiene caracteres inválidos para base64URL.",
      };
    }

    if (!base64urlRegex.test(payload)) {
      return {
        ok: false,
        error: "El PAYLOAD contiene caracteres inválidos para base64URL.",
      };
    }

    if (!base64urlRegex.test(signature)) {
      return {
        ok: false,
        error: "La SIGNATURE contiene caracteres inválidos para base64URL.",
      };
    }

    return { ok: true };
  }



  analizarToken() {
    const token = this.jwtText?.trim();

    const validacion = this.validarTokenFront(token);

    if (!validacion.ok) {
      Swal.fire({
        icon: "error",
        title: "Token inválido",
        text: validacion.error,
        confirmButtonColor: "#d33",
      });
      return;
    }

    this.loading.set(true);
    this.error.set(null);

    this.api.analyze(token).subscribe({
      next: (res: any) => {
        console.log("Respuesta API completa:", res);

        // Ahora sí existen estas señales
        this.header.set(res?.header ?? null);
        this.payload.set(res?.payload ?? null);
        this.signatureValid.set(res?.signatureValid ?? false);

        this.analyzedData.set(res);

        this.handleSuccess(res);  // <-- ALERTA SWEETALERT2 AQUÍ

        this.loading.set(false);
      },

      error: (err: any) => {
        const msg =
          err?.error?.error ??
          err?.message ??
          "Error al analizar el token";

        this.handleError(msg); // usa la alerta correcta

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

  handleSuccess(resp: any) {

    // ❌ Backend retornó success=false
    if (resp.success === false) {
      return Swal.fire({
        icon: 'error',
        title: 'Error en el análisis',
        html: resp.error || resp.errores?.join('<br>') || 'Error desconocido'
      });
    }

    // ❌ Errores léxicos
    if (resp.errores?.length > 0) {
      return Swal.fire({
        icon: 'error',
        title: 'Errores léxicos',
        html: resp.errores.join('<br>')
      });
    }

    // ❌ Sintácticos
    if (resp.sintactico?.errores?.length > 0) {
      return Swal.fire({
        icon: 'error',
        title: 'Errores sintácticos',
        html: resp.sintactico.errores.join('<br>')
      });
    }

    // ❌ Semánticos
    const semanticos = resp.semantico?.errores ?? [];
    if (semanticos.length > 0) {
      return Swal.fire({
        icon: 'warning',
        title: 'Errores semánticos',
        html: semanticos.join('<br>')
      });
    }

    // ❌ Tiempo del token
    const tiempo = resp.semantico?.validacion_tiempo?.errores ?? [];
    if (tiempo.length > 0) {
      return Swal.fire({
        icon: 'warning',
        title: 'Errores en claims de tiempo',
        html: tiempo.join('<br>')
      });
    }

    // ✔ Token válido
    return Swal.fire({
      icon: 'success',
      title: 'Token válido',
      text: 'El token pasó todas las validaciones correctamente.'
    });
  }





  handleError(err: any) {

    const errores = err?.error?.errores || err?.error?.error || err?.message;

    // JSON malo
    if (Array.isArray(errores) && errores.some(e => e.includes("JSON"))) {
      return Swal.fire({
        icon: 'error',
        title: 'Token malformado',
        html: errores.join('<br>')
      });
    }

    // Base64 inválido
    if (Array.isArray(errores) && errores.some(e => e.includes("base64"))) {
      return Swal.fire({
        icon: 'error',
        title: 'Base64 inválido',
        text: 'La codificación base64URL no es válida.'
      });
    }

    // Firma inválida
    if (typeof errores === 'string' && errores.includes("Firma inválida")) {
      return Swal.fire({
        icon: 'error',
        title: 'Firma inválida',
        text: 'La firma no coincide con la clave secreta.'
      });
    }

    // Claims de tiempo mal formados
    if (Array.isArray(errores) && errores.some(e => e.includes("entero"))) {
      return Swal.fire({
        icon: 'error',
        title: 'Error en claims de tiempo',
        html: errores.join('<br>')
      });
    }

    // Error genérico
    return Swal.fire({
      icon: 'error',
      title: 'Error interno',
      text: 'Ocurrió un error inesperado en el análisis.'
    });
  }

}