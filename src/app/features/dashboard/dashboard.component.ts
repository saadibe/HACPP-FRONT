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
        <p>Vue rapide de l'activité HACCP du restaurant.</p>
      </div>
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
      <div class="stat-card clickable" (click)="go('/cleaning-zones')">
        <span>Zones nettoyage</span><strong>{{ stats.checks }}</strong>
      </div>
      <div class="stat-card clickable" (click)="go('/traceability?scope=today')">
        <span>Traçabilité du jour</span><strong>{{ stats.traceabilityToday }}</strong>
      </div>
      <div class="stat-card clickable" (click)="go('/traceability?scope=month')">
        <span>Traçabilité du mois</span><strong>{{ stats.traceabilityMonth }}</strong>
      </div>
      <div class="stat-card clickable" (click)="go('/traceability?scope=year')">
        <span>Traçabilité de l'année</span><strong>{{ stats.traceabilityYear }}</strong>
      </div>
      <div class="stat-card clickable" (click)="go('/fridges')">
        <span>Relevés frigo photo</span><strong>{{ stats.fridgeProofs }}</strong>
      </div>
      <div class="stat-card warning clickable" (click)="go('/alerts/cleaning')">
        <span>Nettoyages en retard</span><strong>{{ stats.lateCleaning }}</strong>
      </div>
      <div class="stat-card warning clickable" (click)="go('/alerts/fridges')">
        <span>Relevés manquants</span><strong>{{ stats.missingFridgeReadings }}</strong>
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
