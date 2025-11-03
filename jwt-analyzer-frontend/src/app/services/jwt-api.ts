// src/app/services/jwt-api.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class JwtApi {
  private base = environment.apiUrl || 'http://127.0.0.1:5000/api';

  constructor(private http: HttpClient) {}

  analyze(token: string): Observable<any> {
    return this.http.post<any>(`${this.base}/analyze`, { jwt: token });
  }

  validate(token: string, secret: string = ''): Observable<any> {
    // si secret está vacío, backend puede devolver decoded but not verified
    return this.http.post<any>(`${this.base}/decode-verify`, { jwt: token, secret, verify: !!secret });
  }

  encode(payload: any, secret: string, algorithm = 'HS256', expires_in?: number) {
    const body: any = { payload, secret, algorithm, validate_secret: true, use_pyjwt: true };
    if (expires_in) body.expires_in = expires_in;
    return this.http.post<any>(`${this.base}/encode`, body);
  }
}
