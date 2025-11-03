import { TestBed } from '@angular/core/testing';
import { App } from './app';

describe('App', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it('should render brand title', () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;

    // Buscamos la clase .brand-title (es más específico y menos frágil que buscar el primer <h1>)
    const title = compiled.querySelector('.brand-title')?.textContent?.trim().toLowerCase() ?? '';
    expect(title).toContain('jwt analyzer'.toLowerCase());
  });
});
