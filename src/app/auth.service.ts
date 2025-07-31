import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, Observable, throwError } from 'rxjs';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:8080/auth/login';

  constructor(
    private http: HttpClient,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  login(credentials: { email: string; password: string }): Observable<any> {
    return this.http.post(this.apiUrl, credentials).pipe(
      catchError((error) => {
        return throwError(() => error);
      })
    );
  }

  saveToken(token: string): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem('token', token);
    }
  }

  getToken(): string | null {
    if (isPlatformBrowser(this.platformId)) {
      return localStorage.getItem('token');
    }
    return null;
  }

  logout(): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem('token');
    }
  }
}
