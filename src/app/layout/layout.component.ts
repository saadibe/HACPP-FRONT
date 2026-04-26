import { Component, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
  template: `
    <div class="app-shell">

      <header class="topbar">
        <div class="brand">
          <div class="brand-logo">LP</div>
          <div>
            <strong>La Perla HACCP</strong>
            <span>Contrôle hygiène</span>
          </div>
        </div>

        <div class="search-box">
          <span>🔍</span>
          <input placeholder="Rechercher...">
        </div>

        <div class="profile-area" (click)="$event.stopPropagation()">
          <button class="profile-trigger" type="button" (click)="toggleUserMenu()">
            <div class="avatar">{{ userInitial }}</div>
            <div class="profile-text">
              <strong>{{ username }}</strong>
              <span>{{ roleLabel }}</span>
            </div>
            <span class="arrow" [class.open]="showUserMenu">⌄</span>
          </button>

          <div class="profile-dropdown" *ngIf="showUserMenu">
            <div class="dropdown-head">
              <div class="avatar big">{{ userInitial }}</div>
              <div>
                <strong>{{ username }}</strong>
                <span>{{ roleLabel }}</span>
              </div>
            </div>

            <button type="button" (click)="go('/users')">👤 Mon compte</button>
            <button type="button" (click)="go('/history')">🕘 Historique</button>
            <button type="button" (click)="go('/hygiene-report')">📄 Rapport hygiène</button>

            <div class="separator"></div>

            <button type="button" class="logout" (click)="logout()">🚪 Déconnexion</button>
          </div>
        </div>
      </header>

      <main class="app-content">
        <router-outlet></router-outlet>
      </main>

      <nav class="bottom-nav">
        <a routerLink="/dashboard" routerLinkActive="active">
          <span class="nav-icon">🏠</span>
          <span>Accueil</span>
        </a>

        <a routerLink="/fridges" routerLinkActive="active">
          <span class="nav-icon">❄️</span>
          <span>Frigo</span>
        </a>

        <a routerLink="/cleaning-zones" routerLinkActive="active">
          <span class="nav-icon">🧴</span>
          <span>Nettoyage</span>
        </a>

        <a routerLink="/traceability" routerLinkActive="active">
          <span class="nav-icon">📋</span>
          <span>Traçabilité</span>
        </a>

        <a routerLink="/history" routerLinkActive="active">
          <span class="nav-icon">🕘</span>
          <span>Historique</span>
        </a>

        <a routerLink="/hygiene-report" routerLinkActive="active">
          <span class="nav-icon">📄</span>
          <span>Rapport</span>
        </a>
      </nav>

    </div>
  `,
  styles: [`
    .app-shell {
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      background:
        radial-gradient(circle at top left, #eef7ff 0, #f8fbff 42%, #ffffff 100%);
    }

    .topbar {
      height: 86px;
      background: linear-gradient(180deg, #07518d 0%, #063d73 100%);
      color: #fff;
      display: grid;
      grid-template-columns: 320px 1fr 270px;
      align-items: center;
      gap: 22px;
      padding: 0 28px;
      box-shadow: 0 10px 28px rgba(7, 81, 141, .22);
      z-index: 40;
    }

    .brand {
      display: flex;
      align-items: center;
      gap: 14px;
    }

    .brand-logo {
      width: 52px;
      height: 52px;
      border-radius: 12px;
      background: #fff;
      color: #063d73;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 24px;
      font-weight: 900;
      box-shadow: 0 8px 18px rgba(0,0,0,.12);
    }

    .brand strong {
      display: block;
      font-size: 23px;
      line-height: 1;
    }

    .brand span {
      display: block;
      margin-top: 6px;
      font-size: 14px;
      opacity: .88;
    }

    .search-box {
      max-width: 520px;
      width: 100%;
      height: 48px;
      justify-self: center;
      border: 1px solid rgba(255,255,255,.35);
      border-radius: 14px;
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 0 18px;
      background: rgba(255,255,255,.07);
    }

    .search-box input {
      width: 100%;
      border: none;
      outline: none;
      background: transparent;
      color: white;
      font-size: 16px;
    }

    .search-box input::placeholder {
      color: rgba(255,255,255,.78);
    }

    .profile-area {
      position: relative;
      justify-self: end;
    }

    .profile-trigger {
      border: none;
      background: transparent;
      color: white;
      display: flex;
      align-items: center;
      gap: 12px;
      cursor: pointer;
      padding: 8px 10px;
      border-radius: 16px;
    }

    .profile-trigger:hover {
      background: rgba(255,255,255,.1);
    }

    .avatar {
      width: 48px;
      height: 48px;
      border-radius: 50%;
      background: white;
      color: #073f77;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 900;
      font-size: 22px;
    }

    .avatar.big {
      width: 58px;
      height: 58px;
      background: linear-gradient(180deg, #07518d, #063d73);
      color: #fff;
    }

    .profile-text {
      text-align: left;
      line-height: 1.1;
    }

    .profile-text strong {
      display: block;
      font-size: 18px;
    }

    .profile-text span {
      display: block;
      font-size: 14px;
      opacity: .85;
      margin-top: 4px;
    }

    .arrow {
      font-size: 26px;
      transition: .18s ease;
    }

    .arrow.open {
      transform: rotate(180deg);
    }

    .profile-dropdown {
      position: absolute;
      top: 74px;
      right: 0;
      width: 300px;
      background: #fff;
      border-radius: 20px;
      padding: 14px;
      box-shadow: 0 22px 46px rgba(16,24,40,.22);
      border: 1px solid #e6edf5;
      animation: menuIn .16s ease;
    }

    .profile-dropdown::before {
      content: '';
      position: absolute;
      top: -13px;
      right: 28px;
      width: 28px;
      height: 28px;
      background: #fff;
      transform: rotate(45deg);
      border-left: 1px solid #e6edf5;
      border-top: 1px solid #e6edf5;
    }

    @keyframes menuIn {
      from { opacity: 0; transform: translateY(-8px) scale(.98); }
      to { opacity: 1; transform: translateY(0) scale(1); }
    }

    .dropdown-head {
      display: flex;
      align-items: center;
      gap: 14px;
      padding: 10px 8px 14px;
      border-bottom: 1px solid #e6edf5;
      margin-bottom: 12px;
    }

    .dropdown-head strong {
      color: #101828;
      display: block;
      font-size: 18px;
    }

    .dropdown-head span {
      color: #344054;
      display: block;
      margin-top: 4px;
      font-weight: 800;
    }

    .profile-dropdown button {
      width: 100%;
      border: none;
      background: linear-gradient(180deg, #07518d, #063d73);
      color: white;
      border-radius: 13px;
      padding: 14px 16px;
      margin-bottom: 9px;
      text-align: left;
      font-size: 16px;
      font-weight: 900;
      cursor: pointer;
      box-shadow: inset 0 0 0 1px rgba(255,255,255,.08);
    }

    .profile-dropdown button:hover {
      filter: brightness(1.08);
    }

    .separator {
      height: 1px;
      background: #e6edf5;
      margin: 10px 0 12px;
    }

    .profile-dropdown .logout {
      margin-bottom: 0;
    }

    .app-content {
      flex: 1;
      overflow: auto;
      padding: 34px 36px 110px;
    }

    .bottom-nav {
      position: fixed;
      left: 36px;
      right: 36px;
      bottom: 22px;
      height: 92px;
      background: #fff;
      border: 1px solid #dbe7f3;
      border-radius: 28px;
      display: grid;
      grid-template-columns: repeat(6, 1fr);
      align-items: center;
      box-shadow: 0 18px 42px rgba(15,76,129,.16);
      z-index: 35;
      overflow: visible;
    }

    .bottom-nav a {
      text-decoration: none;
      color: #344054;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      font-weight: 800;
      gap: 6px;
      height: 100%;
      border-right: 1px solid #e4edf6;
    }

    .bottom-nav a:last-child {
      border-right: none;
    }

    .nav-icon {
      font-size: 27px;
      color: #063d73;
    }

    .bottom-nav a.active {
      color: #063d73;
    }

    .center-nav {
      position: relative;
      margin-top: -54px;
      color: white !important;
      border-right: none !important;
    }

    .center-icon {
      width: 86px;
      height: 86px;
      border-radius: 50%;
      background: linear-gradient(180deg, #075fba, #063d73);
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 34px;
      box-shadow: 0 14px 28px rgba(7,81,141,.3);
      margin-bottom: -2px;
    }

    .center-nav span:last-child {
      background: linear-gradient(180deg, #075fba, #063d73);
      color: white;
      padding: 0 8px 12px;
      border-radius: 0 0 999px 999px;
      margin-top: -13px;
      min-width: 86px;
      text-align: center;
    }

    @media (max-width: 850px) {
      .topbar {
        height: 72px;
        grid-template-columns: 1fr auto;
        padding: 0 12px;
      }

      .brand strong {
        font-size: 16px;
      }

      .brand span,
      .search-box,
      .profile-text {
        display: none;
      }

      .brand-logo {
        width: 42px;
        height: 42px;
        font-size: 18px;
      }

      .avatar {
        width: 42px;
        height: 42px;
        font-size: 18px;
      }

      .profile-dropdown {
        top: 62px;
        width: 260px;
        right: -4px;
      }

      .app-content {
        padding: 16px 14px 104px;
      }

      .bottom-nav {
        left: 8px;
        right: 8px;
        bottom: 10px;
        height: 76px;
        border-radius: 24px;
      }

      .bottom-nav a {
        font-size: 10px;
      }

      .nav-icon {
        font-size: 22px;
      }

      .center-icon {
        width: 70px;
        height: 70px;
        font-size: 28px;
      }

      .center-nav span:last-child {
        min-width: 70px;
        font-size: 10px;
      }
    }
  `]
})
export class LayoutComponent {
  showUserMenu = false;

  constructor(private router: Router) {}

  get username(): string {
    return localStorage.getItem('username') || 'Utilisateur';
  }

  get userInitial(): string {
    return this.username.charAt(0).toUpperCase();
  }

  get roleLabel(): string {
    const role = localStorage.getItem('role') || '';
    return role.includes('ADMIN') ? 'ADMIN' : 'STAFF';
  }

  toggleUserMenu(): void {
    this.showUserMenu = !this.showUserMenu;
  }

  closeUserMenu(): void {
    this.showUserMenu = false;
  }

  go(path: string): void {
    this.closeUserMenu();
    this.router.navigate([path]);
  }

  logout(): void {
    localStorage.clear();
    this.closeUserMenu();
    this.router.navigate(['/login']);
  }

  @HostListener('document:click')
  onDocumentClick(): void {
    this.closeUserMenu();
  }
}