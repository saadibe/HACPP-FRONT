import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ApiService, DashboardResponse } from '../../core/api.service';

@Component({
  standalone: true,
  imports: [CommonModule],
  template: `
    <section class="page-top">
      <div>
        <h1>Dashboard</h1>
        <p>Vue rapide des contrôles HACCP et accès direct aux actions terrain.</p>
      </div>
    </section>

    <section class="quick-actions-panel">
      <button class="quick-action-card" (click)="go('/fridges')">
        <span class="quick-icon">🌡️</span>
        <strong>Relevé frigo</strong>
        <small>Prendre une photo et saisir la température</small>
      </button>

      <button class="quick-action-card" (click)="go('/cleaning-zones')">
        <span class="quick-icon">🧼</span>
        <strong>Preuve nettoyage</strong>
        <small>Photo directe tablette / téléphone</small>
      </button>

      <button class="quick-action-card" (click)="go('/traceability')">
        <span class="quick-icon">📦</span>
        <strong>Traçabilité</strong>
        <small>Factures, lots et preuves multiples</small>
      </button>

      <button class="quick-action-card" (click)="go('/history')">
        <span class="quick-icon">🕘</span>
        <strong>Historique</strong>
        <small>Consulter les preuves par date et type</small>
      </button>
    </section>

    <div class="stats-grid" *ngIf="stats">
      <div class="stat-card clickable" (click)="go('/fridges')">
        <span>Frigos</span><strong>{{ stats.fridges }}</strong>
      </div>
      <div class="stat-card clickable" (click)="go('/traceability')">
        <span>Traçabilité aujourd'hui</span><strong>{{ stats.traceabilityToday }}</strong>
      </div>
      <div class="stat-card clickable" (click)="go('/cleaning-zones')">
        <span>Nettoyage en retard</span><strong>{{ stats.lateCleaning }}</strong>
      </div>
      <div class="stat-card clickable" (click)="go('/fridges')">
        <span>Alertes température</span><strong>{{ stats.temperatureAlerts }}</strong>
      </div>
    </div>
  `
})
export class DashboardComponent implements OnInit {
  private api = inject(ApiService);
  private router = inject(Router);

  stats?: DashboardResponse;

  ngOnInit(): void {
    this.api.getDashboard().subscribe({
      next: v => this.stats = v,
      error: () => {}
    });
  }

  go(path: string): void {
    this.router.navigateByUrl(path);
  }
}
