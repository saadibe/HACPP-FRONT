import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ApiService, DashboardResponse } from '../../core/api.service';

@Component({
  standalone: true,
  imports: [CommonModule],
  template: `
    <section class="page-head">
      <div>
        <h1>Dashboard HACCP</h1>
        <p>Résumé du jour et accès rapide aux contrôles terrain.</p>
      </div>

      <button class="refresh-btn" type="button" (click)="load()">
        Actualiser
      </button>
    </section>

    <section class="quick-grid">
      <button class="quick-card blue" type="button" (click)="go('/fridges')">
        <span class="icon">🌡️</span>
        <strong>Relevé frigo</strong>
        <small>Température + photo preuve</small>
      </button>

      <button class="quick-card green" type="button" (click)="go('/cleaning-zones')">
        <span class="icon">🧼</span>
        <strong>Preuve nettoyage</strong>
        <small>Photo directe tablette</small>
      </button>

      <button class="quick-card amber" type="button" (click)="go('/traceability')">
        <span class="icon">📦</span>
        <strong>Traçabilité</strong>
        <small>Factures, lots, DLC</small>
      </button>

      <button class="quick-card gray" type="button" (click)="go('/history')">
        <span class="icon">🕘</span>
        <strong>Historique</strong>
        <small>Preuves par date et type</small>
      </button>
    </section>

    <section class="kpi-grid" *ngIf="stats">
      <div class="kpi-card">
        <span>Frigos</span>
        <strong>{{ stats.fridges }}</strong>
      </div>

      <div class="kpi-card">
        <span>Traçabilité aujourd'hui</span>
        <strong>{{ stats.traceabilityToday }}</strong>
      </div>

      <div class="kpi-card warning">
        <span>Nettoyages en retard</span>
        <strong>{{ stats.lateCleaning }}</strong>
      </div>

      <div class="kpi-card danger">
        <span>Alertes température</span>
        <strong>{{ stats.temperatureAlerts }}</strong>
      </div>
    </section>

    <section class="alert-panel" *ngIf="stats">
      <h2>Priorités du jour</h2>

      <div class="alert-row danger" *ngIf="stats.temperatureAlerts > 0">
        <strong>Température</strong>
        <span>{{ stats.temperatureAlerts }} alerte(s) à vérifier</span>
        <button type="button" (click)="go('/fridges')">Voir</button>
      </div>

      <div class="alert-row warning" *ngIf="stats.lateCleaning > 0">
        <strong>Nettoyage</strong>
        <span>{{ stats.lateCleaning }} tâche(s) en retard</span>
        <button type="button" (click)="go('/cleaning-zones')">Voir</button>
      </div>

      <div class="alert-row neutral" *ngIf="stats.temperatureAlerts === 0 && stats.lateCleaning === 0">
        <strong>Situation normale</strong>
        <span>Aucune priorité critique détectée.</span>
      </div>
    </section>
  `,
  styles: [`
    .page-head {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 16px;
      margin-bottom: 18px;
    }

    .page-head h1 {
      margin: 0;
      font-size: 30px;
      color: #101828;
    }

    .page-head p {
      margin: 4px 0 0;
      color: #667085;
    }

    .refresh-btn {
      border: none;
      background: #0f4c81;
      color: white;
      border-radius: 14px;
      padding: 12px 16px;
      font-weight: 900;
      cursor: pointer;
    }

    .quick-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(210px, 1fr));
      gap: 14px;
      margin-bottom: 18px;
    }

    .quick-card {
      border: 1px solid #e4e7ec;
      background: #fff;
      border-radius: 22px;
      padding: 18px;
      text-align: left;
      cursor: pointer;
      box-shadow: 0 10px 24px rgba(16,24,40,.06);
      transition: .15s ease;
    }

    .quick-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 16px 32px rgba(16,24,40,.1);
    }

    .quick-card .icon {
      font-size: 30px;
      display: block;
      margin-bottom: 10px;
    }

    .quick-card strong {
      display: block;
      font-size: 17px;
      color: #101828;
      margin-bottom: 4px;
    }

    .quick-card small {
      color: #667085;
      font-weight: 700;
    }

    .quick-card.blue { border-top: 5px solid #0f4c81; }
    .quick-card.green { border-top: 5px solid #12b76a; }
    .quick-card.amber { border-top: 5px solid #f79009; }
    .quick-card.gray { border-top: 5px solid #667085; }

    .kpi-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(190px, 1fr));
      gap: 14px;
      margin-bottom: 18px;
    }

    .kpi-card {
      background: white;
      border-radius: 20px;
      padding: 18px;
      border: 1px solid #e4e7ec;
      box-shadow: 0 8px 20px rgba(16,24,40,.05);
    }

    .kpi-card span {
      color: #667085;
      font-weight: 800;
      font-size: 13px;
    }

    .kpi-card strong {
      display: block;
      font-size: 32px;
      color: #101828;
      margin-top: 8px;
    }

    .kpi-card.warning strong {
      color: #f79009;
    }

    .kpi-card.danger strong {
      color: #d92d20;
    }

    .alert-panel {
      background: white;
      border-radius: 22px;
      padding: 18px;
      border: 1px solid #e4e7ec;
      box-shadow: 0 8px 20px rgba(16,24,40,.05);
    }

    .alert-panel h2 {
      margin: 0 0 12px;
      font-size: 20px;
      color: #101828;
    }

    .alert-row {
      display: grid;
      grid-template-columns: 160px 1fr auto;
      gap: 12px;
      align-items: center;
      padding: 13px;
      border-radius: 14px;
      margin-top: 8px;
      font-weight: 800;
    }

    .alert-row button {
      border: none;
      border-radius: 10px;
      padding: 9px 12px;
      font-weight: 900;
      cursor: pointer;
      background: #fff;
    }

    .alert-row.danger {
      background: #fff1f3;
      color: #b42318;
    }

    .alert-row.warning {
      background: #fffaeb;
      color: #b54708;
    }

    .alert-row.neutral {
      background: #ecfdf3;
      color: #027a48;
      grid-template-columns: 160px 1fr;
    }

    @media (max-width: 700px) {
      .page-head {
        display: grid;
      }

      .alert-row {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class DashboardComponent implements OnInit {
  private api = inject(ApiService);
  private router = inject(Router);

  stats?: DashboardResponse;

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.api.getDashboard().subscribe({
      next: value => this.stats = value,
      error: () => {}
    });
  }

  go(path: string): void {
    this.router.navigateByUrl(path);
  }
}