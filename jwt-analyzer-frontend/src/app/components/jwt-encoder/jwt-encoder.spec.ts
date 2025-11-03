import { ComponentFixture, TestBed } from '@angular/core/testing';

import { JwtEncoder } from './jwt-encoder';

describe('JwtEncoder', () => {
  let component: JwtEncoder;
  let fixture: ComponentFixture<JwtEncoder>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [JwtEncoder]
    })
    .compileComponents();

    fixture = TestBed.createComponent(JwtEncoder);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
