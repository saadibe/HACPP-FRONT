import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
  template: `
    <div class="app-shell">
      <aside class="sidebar">
        <div class="brand">
          <div class="brand-icon">LP</div>
          <div>
            <h2>La Perla HACCP</h2>
            <span>Contrôle hygiène</span>
          </div>
        </div>

        <nav class="nav">
          <a routerLink="/dashboard" routerLinkActive="active">📊 Dashboard</a>
          <a routerLink="/fridges" routerLinkActive="active">🌡️ Frigos</a>
          <a routerLink="/cleaning-zones" routerLinkActive="active">🧼 Nettoyage</a>
          <a routerLink="/traceability" routerLinkActive="active">📦 Traçabilité</a>
          <a routerLink="/history" routerLinkActive="active">🕘 Historique</a>
          <a routerLink="/hygiene-report" routerLinkActive="active">📄 Rapport hygiène</a>
          <a routerLink="/users" routerLinkActive="active">👥 Utilisateurs</a>
        </nav>

        <div class="user-panel">
          <button class="user-card" type="button" (click)="toggleUserMenu()">
            <div class="avatar">{{ userInitial }}</div>
            <div class="user-text">
              <strong>{{ username }}</strong>
              <span>{{ roleLabel }}</span>
            </div>
            <span class="chevron">▾</span>
          </button>

          <div class="user-menu" *ngIf="userMenuOpen">
            <button type="button" routerLink="/users" (click)="closeUserMenu()">👤 Mon compte</button>
            <button type="button" routerLink="/history" (click)="closeUserMenu()">🕘 Historique</button>
            <button type="button" class="danger" (click)="logout()">🚪 Déconnexion</button>
          </div>
        </div>
      </aside>

      <main class="content">
        <router-outlet></router-outlet>
      </main>
    </div>
  `,
  styles: [`
    .app-shell {
      min-height: 100vh;
      display: flex;
      background: #f6f8fb;
    }

    .sidebar {
      width: 280px;
      background: linear-gradient(180deg, #0f4c81 0%, #09365e 100%);
      color: #fff;
      padding: 20px;
      display: flex;
      flex-direction: column;
      gap: 22px;
      box-shadow: 8px 0 24px rgba(15, 76, 129, .12);
    }

    .brand {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .brand-icon {
      width: 52px;
      height: 52px;
      border-radius: 16px;
      background: rgba(255,255,255,.16);
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 900;
      letter-spacing: .5px;
    }

    .brand h2 {
      margin: 0;
      font-size: 18px;
      line-height: 1.1;
    }

    .brand span {
      font-size: 12px;
      opacity: .78;
    }

    .nav {
      display: grid;
      gap: 9px;
    }

    .nav a {
      color: #fff;
      text-decoration: none;
      padding: 12px 14px;
      border-radius: 14px;
      font-weight: 800;
      background: rgba(255,255,255,.08);
      transition: .15s ease;
    }

    .nav a:hover,
    .nav a.active {
      background: rgba(255,255,255,.18);
      transform: translateX(2px);
    }

    .user-panel {
      margin-top: auto;
      position: relative;
    }

    .user-card {
      width: 100%;
      border: none;
      color: #fff;
      background: rgba(255,255,255,.12);
      border-radius: 18px;
      padding: 12px;
      display: flex;
      align-items: center;
      gap: 12px;
      cursor: pointer;
      text-align: left;
    }

    .avatar {
      width: 44px;
      height: 44px;
      border-radius: 50%;
      background: rgba(255,255,255,.22);
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 900;
      font-size: 18px;
    }

    .user-text {
      flex: 1;
      display: grid;
      gap: 2px;
    }

    .user-text strong {
      font-size: 14px;
    }

    .user-text span {
      font-size: 12px;
      opacity: .8;
    }

    .chevron {
      opacity: .75;
    }

    .user-menu {
      margin-top: 8px;
      background: #fff;
      border-radius: 16px;
      padding: 8px;
      box-shadow: 0 16px 30px rgba(0,0,0,.15);
    }

    .user-menu button {
      width: 100%;
      border: none;
      background: transparent;
      padding: 11px 12px;
      border-radius: 12px;
      text-align: left;
      color: #0f4c81;
      font-weight: 800;
      cursor: pointer;
    }

    .user-menu button:hover {
      background: #eef4fb;
    }

    .user-menu .danger {
      color: #b42318;
    }

    .content {
      flex: 1;
      padding: 22px;
      overflow: auto;
    }

    @media (max-width: 900px) {
      .app-shell {
        display: block;
      }

      .sidebar {
        width: auto;
        min-height: auto;
        border-radius: 0 0 24px 24px;
      }

      .nav {
        grid-template-columns: repeat(2, minmax(0, 1fr));
      }

      .content {
        padding: 14px;
      }
    }
  `]
})
export class LayoutComponent {
  userMenuOpen = false;

  constructor(private router: Router) {}

  get username(): string {
    return localStorage.getItem('username') || 'Utilisateur';
  }

  get userInitial(): string {
    return this.username.charAt(0).toUpperCase();
  }

  get roleLabel(): string {
    const role = localStorage.getItem('role') || '';
    if (role.includes('ADMIN')) return 'Administrateur';
    return 'Équipe';
  }

  toggleUserMenu(): void {
    this.userMenuOpen = !this.userMenuOpen;
  }

  closeUserMenu(): void {
    this.userMenuOpen = false;
  }

  logout(): void {
    localStorage.clear();
    this.router.navigate(['/login']);
  }
}