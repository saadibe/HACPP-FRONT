import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, RouterOutlet],
  template: `
    <div class="layout">
      <aside class="sidebar">
        <div class="brand">
          <div class="brand-mark">LP</div>
          <div>
            <h2>La Perla HACCP</h2>
            <p>Back-office restaurant</p>
          </div>
        </div>

        <nav>
          <a routerLink="/dashboard" routerLinkActive="active">Dashboard</a>
          <a routerLink="/fridges" routerLinkActive="active">Frigos</a>
          <a routerLink="/cleaning-zones" routerLinkActive="active">Zones de nettoyage</a>
          <a routerLink="/traceability" routerLinkActive="active">Traçabilité</a>
          <a routerLink="/batches" routerLinkActive="active">Lots DLC</a>
        </nav>

        <div class="sidebar-footer">
          <div class="user-box">
            <div class="user-avatar">{{ (username || 'A').charAt(0).toUpperCase() }}</div>
            <div>
              <strong>{{ username || 'Utilisateur' }}</strong>
              <p>Connecté</p>
            </div>
          </div>
          <button class="secondary" (click)="logout()">Déconnexion</button>
        </div>
      </aside>

      <main class="content">
        <router-outlet></router-outlet>
      </main>
    </div>
  `
})
export class LayoutComponent {
  username = localStorage.getItem('username') || '';

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    window.location.href = '/login';
  }
}
