import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
  <div class="sidebar">
    <div class="logo">
      <div class="logo-icon">LP</div>
      <div>
        <h2>La Perla HACCP</h2>
        <small>Gestion restaurant</small>
      </div>
    </div>

    <nav>
      <button routerLink="/dashboard">Dashboard</button>
      <button routerLink="/fridges">Frigos</button>
      <button routerLink="/cleaning-zones">Nettoyage</button>
      <button routerLink="/traceability">Traçabilité</button>
      <button routerLink="/batches">Lots DLC</button>
      <button routerLink="/users">Utilisateurs</button>
      <button routerLink="/hygiene-report">Rapport hygiène</button>
    </nav>

    <div class="sidebar-bottom">

      <div class="sidebar-user" (click)="toggleUserMenu()">
        <div class="user-avatar">
          {{ username.charAt(0).toUpperCase() }}
        </div>

        <div class="user-info">
          <strong>{{ username }}</strong>
          <span>{{ roleLabel }}</span>
        </div>

        <span class="user-arrow">▾</span>
      </div>

      <div class="user-dropdown" *ngIf="userMenuOpen">
        <button>
          👤 Mon compte
        </button>

        <button class="logout" (click)="logout()">
          🚪 Déconnexion
        </button>
      </div>

    </div>
  </div>

  <div class="main-content">
    <router-outlet></router-outlet>
  </div>
  `,
  styles: [`
  .sidebar {
    width: 260px;
    height: 100vh;
    background: linear-gradient(180deg, #0f4c81, #0c3c66);
    color: white;
    display: flex;
    flex-direction: column;
    padding: 20px;
  }

  .logo {
    display: flex;
    gap: 12px;
    align-items: center;
    margin-bottom: 30px;
  }

  .logo-icon {
    width: 50px;
    height: 50px;
    border-radius: 12px;
    background: rgba(255,255,255,0.2);
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: bold;
  }

  nav {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  nav button {
    background: rgba(255,255,255,0.1);
    border: none;
    color: white;
    padding: 14px;
    border-radius: 14px;
    text-align: left;
    font-weight: 600;
    cursor: pointer;
    transition: 0.2s;
  }

  nav button:hover {
    background: rgba(255,255,255,0.2);
  }

  .sidebar-bottom {
    margin-top: auto;
  }

  .sidebar-user {
    display: flex;
    align-items: center;
    gap: 12px;
    background: rgba(255,255,255,0.12);
    border-radius: 18px;
    padding: 12px;
    cursor: pointer;
  }

  .user-avatar {
    width: 42px;
    height: 42px;
    border-radius: 50%;
    background: rgba(255,255,255,0.2);
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 800;
  }

  .user-info {
    flex: 1;
    display: flex;
    flex-direction: column;
  }

  .user-info strong {
    font-size: 14px;
  }

  .user-info span {
    font-size: 12px;
    opacity: 0.8;
  }

  .user-arrow {
    font-size: 12px;
  }

  .user-dropdown {
    margin-top: 8px;
    background: white;
    border-radius: 14px;
    padding: 6px;
    color: #0f4c81;
  }

  .user-dropdown button {
    width: 100%;
    border: none;
    background: transparent;
    padding: 10px;
    border-radius: 10px;
    text-align: left;
    font-weight: 600;
    cursor: pointer;
  }

  .user-dropdown button:hover {
    background: #eef4fb;
  }

  .user-dropdown .logout {
    color: #b42318;
  }

  .main-content {
    margin-left: 260px;
    padding: 20px;
  }
  `]
})
export class LayoutComponent {

  userMenuOpen = false;

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
    location.href = '/login';
  }
}