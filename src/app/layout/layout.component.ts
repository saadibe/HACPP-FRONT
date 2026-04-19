import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, RouterOutlet],
  template: `
    <div class="app-shell">
      <aside class="mobile-drawer-backdrop" *ngIf="menuOpen" (click)="closeMenu()"></aside>

      <aside class="sidebar" [class.open]="menuOpen">
        <div class="brand-block">
          <div class="brand-top">
            <div class="brand-mark">LP</div>
            <div>
              <h2>La Perla HACCP</h2>
              <p>Gestion restaurant</p>
            </div>
          </div>

          <button class="close-menu-btn" type="button" (click)="closeMenu()">×</button>
        </div>

        <nav class="nav-links">
          <a routerLink="/dashboard" routerLinkActive="active" (click)="closeMenu()">Dashboard</a>
          <a routerLink="/fridges" routerLinkActive="active" (click)="closeMenu()">Frigos</a>
          <a routerLink="/cleaning-zones" routerLinkActive="active" (click)="closeMenu()">Nettoyage</a>
          <a routerLink="/traceability" routerLinkActive="active" (click)="closeMenu()">Traçabilité</a>
          <a routerLink="/batches" routerLinkActive="active" (click)="closeMenu()">Lots DLC</a>
          <a routerLink="/alerts/cleaning" routerLinkActive="active" (click)="closeMenu()">Alertes nettoyage</a>
          <a routerLink="/alerts/fridges" routerLinkActive="active" (click)="closeMenu()">Alertes frigos</a>
        </nav>

        <div class="sidebar-footer">
          <div class="user-box">
            <div class="user-avatar">{{ (username || 'A').charAt(0).toUpperCase() }}</div>
            <div>
              <strong>{{ username || 'Utilisateur' }}</strong>
              <p>{{ roleLabel }}</p>
            </div>
          </div>
          <button class="secondary" (click)="logout()">Déconnexion</button>
        </div>
      </aside>

      <div class="main-shell">
        <header class="topbar">
          <div class="topbar-left">
            <button class="menu-btn" type="button" (click)="toggleMenu()">☰</button>
            <div class="topbar-title">
              <strong>La Perla HACCP</strong>
              <span>Interface responsive tablette / mobile</span>
            </div>
          </div>

          <div class="topbar-right">
            <div class="online-pill">En ligne</div>
          </div>
        </header>

        <main class="content">
          <router-outlet></router-outlet>
        </main>
      </div>
    </div>
  `
})
export class LayoutComponent {
  username = localStorage.getItem('username') || '';
  role = localStorage.getItem('role') || '';
  menuOpen = false;

  get roleLabel(): string {
    return this.role === 'ROLE_ADMIN' ? 'Administrateur' : 'Équipe';
  }

  toggleMenu(): void {
    this.menuOpen = !this.menuOpen;
  }

  closeMenu(): void {
    this.menuOpen = false;
  }

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    localStorage.removeItem('role');
    window.location.href = '/login';
  }
}
