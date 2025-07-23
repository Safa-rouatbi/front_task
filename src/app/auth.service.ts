import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, Observable, throwError } from 'rxjs';
import { error } from 'console';


@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl= 'http://localhost:8080/auth/login';

  constructor(private http: HttpClient) { }

  login(credentials: {email:string; password: string}): Observable<any>{
    return this.http.post(this.apiUrl, credentials).pipe(
      catchError((error)=>{
        return throwError(()=>error);
      })
    );
  }

  saveToken(token: string): void {
    localStorage.setItem('token', token);
  }

   getToken(): string | null {
    return localStorage.getItem('token');
  }

  logout(): void {
    localStorage.removeItem('token');
  }
}
