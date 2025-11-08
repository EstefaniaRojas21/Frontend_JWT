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

  // Helper para verificar si hay datos
  hasAnyData(): boolean {
    if (!this.result) return false;
    
    return !!(
      this.result.alfabeto ||
      this.result.tokens?.length ||
      this.result.header ||
      this.result.payload ||
      this.result.arbol_sintactico ||
      this.result.gramatica ||
      this.result.validaciones ||
      this.result.tabla_simbolos ||
      this.result.errores?.length ||
      this.result.advertencias?.length
    );
  }
}