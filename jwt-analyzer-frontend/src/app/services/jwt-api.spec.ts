import { TestBed } from '@angular/core/testing';

import { JwtApi } from './jwt-api';

describe('JwtApi', () => {
  let service: JwtApi;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(JwtApi);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
