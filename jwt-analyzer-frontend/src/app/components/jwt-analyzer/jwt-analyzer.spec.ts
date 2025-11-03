import { ComponentFixture, TestBed } from '@angular/core/testing';

import { JwtAnalyzer } from './jwt-analyzer';

describe('JwtAnalyzer', () => {
  let component: JwtAnalyzer;
  let fixture: ComponentFixture<JwtAnalyzer>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [JwtAnalyzer]
    })
    .compileComponents();

    fixture = TestBed.createComponent(JwtAnalyzer);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
