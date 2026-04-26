import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink],
  template: `
  <div class="app-shell">

    <!-- TOP BAR -->
    <header class="topbar">
      <div class="logo">LP</div>
      <div class="title">La Perla HACCP</div>

      <!-- USER -->
      <div class="user-menu-container">
        <div class="user-trigger" (click)="toggleUserMenu()">
          👤 {{ username }} ⌄
        </div>

        <div class="dropdown" *ngIf="showUserMenu">
          <button (click)="goProfile()">👤 Mon compte</button>
          <button (click)="goHistory()">🕘 Historique</button>
          <hr>
          <button class="logout" (click)="logout()">🚪 Déconnexion</button>
        </div>
      </div>
    </header>

    <!-- CONTENT -->
    <main class="app-content">
      <router-outlet></router-outlet>
    </main>

    <!-- BOTTOM NAV -->
    <nav class="bottom-nav">
      <a routerLink="/dashboard">🏠<span>Home</span></a>
      <a routerLink="/fridges">❄️<span>Frigo</span></a>
      <a routerLink="/cleaning-zones">🧼<span>Nettoyage</span></a>

      <!-- bouton central -->
      <button class="fab" routerLink="/traceability">📷</button>

      <a routerLink="/history">🕘<span>Historique</span></a>
      <a routerLink="/hygiene-report">📄<span>Rapport</span></a>
    </nav>

  </div>
  `,
  styles: [`
    .app-shell {
      display: flex;
      flex-direction: column;
      height: 100vh;
      background: #f6f8fb;
    }

    /* TOP BAR */
    .topbar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      background: #0f4c81;
      color: white;
      padding: 10px 16px;
    }

    .logo {
      background: white;
      color: #0f4c81;
      font-weight: bold;
      padding: 6px 10px;
      border-radius: 8px;
    }

    .title {
      font-weight: bold;
    }

    /* USER */
    .user-menu-container {
      position: relative;
    }

    .user-trigger {
      cursor: pointer;
      font-weight: bold;
    }

    .dropdown {
      position: absolute;
      right: 0;
      top: 35px;
      background: white;
      color: black;
      border-radius: 12px;
      padding: 10px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.2);
      min-width: 160px;
    }

    .dropdown button {
      display: block;
      width: 100%;
      border: none;
      background: none;
      padding: 8px;
      text-align: left;
      cursor: pointer;
      border-radius: 8px;
    }

    .dropdown button:hover {
      background: #eef4fb;
    }

    .dropdown hr {
      border: none;
      border-top: 1px solid #ddd;
      margin: 6px 0;
    }

    .logout {
      color: red;
      font-weight: bold;
    }

    /* CONTENT */
    .app-content {
      flex: 1;
      overflow: auto;
      padding: 10px;
    }

    /* BOTTOM NAV */
    .bottom-nav {
      display: flex;
      justify-content: space-around;
      align-items: center;
      background: #0f4c81;
      padding: 8px;
      position: sticky;
      bottom: 0;
    }

    .bottom-nav a {
      color: white;
      text-decoration: none;
      font-size: 12px;
      display: flex;
      flex-direction: column;
      align-items: center;
    }

    /* BOUTON CENTRAL */
    .fab {
      background: #ff6b00;
      border: none;
      border-radius: 50%;
      width: 60px;
      height: 60px;
      color: white;
      font-size: 24px;
      margin-top: -30px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.3);
      cursor: pointer;
    }
  `]
})
export class LayoutComponent {

  showUserMenu = false;

  constructor(private router: Router) {}

  get username(): string {
    return localStorage.getItem('username') || 'Utilisateur';
  }

  toggleUserMenu(): void {
    this.showUserMenu = !this.showUserMenu;
  }

  logout(): void {
    localStorage.clear();
    this.router.navigate(['/login']);
  }

  goProfile(): void {
    this.router.navigate(['/users']);
  }

  goHistory(): void {
    this.router.navigate(['/history']);
  }
}