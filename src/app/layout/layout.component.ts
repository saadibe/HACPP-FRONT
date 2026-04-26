import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import {Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

@Component({
    selector: 'app-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
  template: `
    <div class="app-shell">
      <aside class="app-sidebar">
        <div class="logo">
          <div class="logo-icon">LP</div>
          <div>
            <h2>La Perla HACCP</h2>
            <small>Gestion restaurant</small>
          </div>
        </div>

        <nav class="app-nav">
          <a routerLink="/dashboard" routerLinkActive="active">Dashboard</a>
          <a routerLink="/fridges" routerLinkActive="active">Frigos</a>
          <a routerLink="/cleaning-zones" routerLinkActive="active">Nettoyage</a>
          <a routerLink="/traceability" routerLinkActive="active">Traçabilité</a>
          <a routerLink="/history" routerLinkActive="active">Historique</a>
          <a routerLink="/users" routerLinkActive="active">Utilisateurs</a>
          <a routerLink="/hygiene-report" routerLinkActive="active">Rapport hygiène</a>
        </nav>

        <div class="sidebar-user-wrapper">
          <div class="sidebar-user" (click)="toggleUserMenu()">
            <div class="user-avatar">{{ username.charAt(0).toUpperCase() }}</div>
            <div class="user-info">
              <strong>{{ username }}</strong>
              <span>{{ roleLabel }}</span>
            </div>
            <span class="user-arrow">▾</span>
          </div>

          <div class="user-dropdown" *ngIf="userMenuOpen">
            <button type="button">👤 Mon compte</button>
            <button type="button" class="logout" (click)="logout()">🚪 Déconnexion</button>
          </div>
        </div>
      </aside>

      <main class="app-content">
        <router-outlet></router-outlet>
      </main>
    </div>
  `,
  styles: [`
    .app-shell{min-height:100vh;display:flex;background:#f6f8fb;}
    .app-sidebar{width:270px;background:linear-gradient(180deg,#0f4c81,#0b3a63);color:#fff;display:flex;flex-direction:column;padding:20px;gap:18px;}
    .logo{display:flex;gap:12px;align-items:center;}
    .logo h2{font-size:18px;margin:0;}
    .logo small{opacity:.75;}
    .logo-icon{width:48px;height:48px;border-radius:14px;background:rgba(255,255,255,.16);display:flex;align-items:center;justify-content:center;font-weight:900;}
    .app-nav{display:flex;flex-direction:column;gap:9px;}
    .app-nav a{color:#fff;text-decoration:none;padding:12px 14px;border-radius:14px;font-weight:700;background:rgba(255,255,255,.08);}
    .app-nav a.active,.app-nav a:hover{background:rgba(255,255,255,.18);}
    .sidebar-user-wrapper{margin-top:auto;}
    .sidebar-user{display:flex;align-items:center;gap:12px;background:rgba(255,255,255,.12);border-radius:18px;padding:12px;cursor:pointer;}
    .user-avatar{width:42px;height:42px;border-radius:50%;background:rgba(255,255,255,.2);display:flex;align-items:center;justify-content:center;font-weight:900;}
    .user-info{flex:1;display:flex;flex-direction:column;}
    .user-info strong{font-size:14px;}
    .user-info span{font-size:12px;opacity:.8;}
    .user-dropdown{margin-top:8px;background:#fff;border-radius:16px;padding:8px;}
    .user-dropdown button{width:100%;border:none;background:transparent;padding:11px;border-radius:12px;text-align:left;font-weight:800;color:#0f4c81;}
    .user-dropdown button:hover{background:#eef4fb;}
    .user-dropdown .logout{color:#b42318;}
    .app-content{flex:1;padding:20px;overflow:auto;}
    @media(max-width:900px){.app-shell{display:block}.app-sidebar{width:auto;min-height:auto}.app-nav{display:grid;grid-template-columns:repeat(2,1fr)}}
  `]
})
export class LayoutComponent {
  userMenuOpen = false;
  constructor(private router: Router) {}

  get username(): string {
    return localStorage.getItem('username') || 'Utilisateur';
  }

  get roleLabel(): string {
    const role = localStorage.getItem('role') || '';
    return role.includes('ADMIN') ? 'Administrateur' : 'Équipe';
  }

  toggleUserMenu(): void {
    this.userMenuOpen = !this.userMenuOpen;
  }

logout(): void {
  localStorage.clear();
  this.router.navigate(['/login']);
}
}
