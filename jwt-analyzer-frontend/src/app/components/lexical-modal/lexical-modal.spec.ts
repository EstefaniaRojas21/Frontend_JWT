import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LexicalModal } from './lexical-modal';

describe('LexicalModal', () => {
  let component: LexicalModal;
  let fixture: ComponentFixture<LexicalModal>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LexicalModal]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LexicalModal);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
