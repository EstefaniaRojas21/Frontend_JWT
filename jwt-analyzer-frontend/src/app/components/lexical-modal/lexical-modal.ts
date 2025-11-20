import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule, TitleCasePipe } from '@angular/common';

@Component({
  selector: 'app-lexical-modal',
  standalone: true,
  templateUrl: './lexical-modal.html',
  imports: [CommonModule, TitleCasePipe],
  styleUrls: ['./lexical-modal.scss']
})
export class LexicalModal {
  @Input() currentPhase: 'lexico' | 'sintactico' | 'semantico' = 'lexico';
  @Input() result: any;

  @Output() closed = new EventEmitter<void>();
  @Output() phaseChanged = new EventEmitter<'lexico' | 'sintactico' | 'semantico'>();

  switchPhase(phase: 'lexico' | 'sintactico' | 'semantico') {
    this.phaseChanged.emit(phase);
  }

  close() {
    this.closed.emit();
  }

  hasAnyData(): boolean {
    if (!this.result) return false;
    
    return !!(
      this.result.alfabeto ||
      this.result.tokens?.length ||
      this.result.header_decodificado ||
      this.result.payload_decodificado ||
      this.result.arbol_sintactico ||
      this.result.gramatica ||
      this.result.validaciones ||
      this.result.tabla_simbolos ||
      this.result.errores?.length ||
      this.result.advertencias?.length ||
      this.result.reporte_analisis_lexico ||
      this.result.estructura_detectada ||
      this.result.validacion_tiempo
    );
  }

  truncateValue(value: string, maxLength: number = 60): string {
    if (!value) return '';
    if (value.length <= maxLength) return value;
    return value.substring(0, maxLength) + '...';
  }

  getTokenClass(tipo: string): string {
    const tipoLower = tipo?.toLowerCase() || '';
    if (tipoLower.includes('header')) return 'token-header';
    if (tipoLower.includes('payload')) return 'token-payload';
    if (tipoLower.includes('signature')) return 'token-signature';
    if (tipoLower.includes('dot')) return 'token-dot';
    return 'token-default';
  }


  getAlfabetoValue(alfabeto: any): string {
    if (!alfabeto) return '';
    if (typeof alfabeto === 'string') return alfabeto;
    if (alfabeto.base64url) return alfabeto.base64url;
    return JSON.stringify(alfabeto);
  }
}