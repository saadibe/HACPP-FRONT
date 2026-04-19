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
        <h1>Dashboard terrain</h1>
        <p>Vue rapide des actions urgentes et accès direct aux modules utilisés pendant le service.</p>
      </div>
    </section>

    <section class="quick-actions-panel">
      <button class="quick-action-card" (click)="go('/fridges')">
        <span class="quick-icon">🌡️</span>
        <strong>Relevés frigo</strong>
        <small>Ajouter un relevé ou vérifier les températures</small>
      </button>

      <button class="quick-action-card" (click)="go('/cleaning-zones')">
        <span class="quick-icon">🧼</span>
        <strong>Preuves nettoyage</strong>
        <small>Prendre une photo de preuve rapidement</small>
      </button>

      <button class="quick-action-card" (click)="go('/traceability')">
        <span class="quick-icon">📦</span>
        <strong>Traçabilité</strong>
        <small>Importer une facture ou une pièce fournisseur</small>
      </button>

      <button class="quick-action-card" (click)="go('/batches')">
        <span class="quick-icon">🏷️</span>
        <strong>Lots DLC</strong>
        <small>Créer, imprimer et suivre les étiquettes</small>
      </button>
    </section>

    <div class="stats-grid" *ngIf="stats">
      <div class="stat-card danger clickable" (click)="go('/batches')">
        <span>DLC expirés</span><strong>{{ stats.expired }}</strong>
      </div>
      <div class="stat-card warning clickable" (click)="go('/batches')">
        <span>DLC bientôt expirés</span><strong>{{ stats.expiringSoon }}</strong>
      </div>
      <div class="stat-card clickable" (click)="go('/fridges')">
        <span>Frigos</span><strong>{{ stats.fridges }}</strong>
      </div>
      <div class="stat-card clickable" (click)="go('/traceability?scope=today')">
        <span>Traçabilité du jour</span><strong>{{ stats.traceabilityToday }}</strong>
      </div>
      <div class="stat-card warning clickable" (click)="go('/alerts/cleaning')">
        <span>Nettoyages en retard</span><strong>{{ stats.lateCleaning }}</strong>
      </div>
      <div class="stat-card danger clickable" (click)="go('/alerts/fridges')">
        <span>Températures hors plage</span><strong>{{ stats.temperatureAlerts }}</strong>
      </div>
    </div>
  `
})
export class DashboardComponent implements OnInit {
  private api = inject(ApiService);
  private router = inject(Router);
  stats?: DashboardResponse;

  ngOnInit(): void {
    this.api.getDashboard().subscribe(res => this.stats = res);
  }

  go(url: string): void {
    this.router.navigateByUrl(url);
  }
}
