import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  getToken(): string {
    return localStorage.getItem('token') || '';
  }

  getUsername(): string {
    return localStorage.getItem('username') || '';
  }

  getRole(): string {
    return localStorage.getItem('role') || '';
  }

  isSuperAdmin(): boolean {
    return this.getRole() === 'SUPER_ADMIN';
  }

  logout(): void {
    localStorage.clear();
  }
}