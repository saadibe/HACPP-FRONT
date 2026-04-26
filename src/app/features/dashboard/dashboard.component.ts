import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ApiService, DashboardResponse } from '../../core/api.service';

@Component({
  standalone: true,
  imports: [CommonModule],
  template: `
    <section class="dashboard-page">

      <div class="dashboard-head">
        <h1>Dashboard HACCP</h1>
        <p>Résumé du jour et accès rapide aux contrôles terrain.</p>
      </div>

      <section class="quick-grid">
        <button class="quick-card blue" type="button" (click)="go('/fridges')">
          <div class="icon-circle blue-bg">🌡️</div>
          <div>
            <strong>Relevé frigo</strong>
            <span>Température + photo preuve</span>
          </div>
          <b>›</b>
        </button>

        <button class="quick-card green" type="button" (click)="go('/cleaning-zones')">
          <div class="icon-circle pink-bg">🧽</div>
          <div>
            <strong>Preuve nettoyage</strong>
            <span>Photo directe tablette</span>
          </div>
          <b>›</b>
        </button>

        <button class="quick-card amber" type="button" (click)="go('/traceability')">
          <div class="icon-circle amber-bg">📋</div>
          <div>
            <strong>Traçabilité</strong>
            <span>Factures, lots, DLC</span>
          </div>
          <b>›</b>
        </button>

        <button class="quick-card purple" type="button" (click)="go('/history')">
          <div class="icon-circle purple-bg">🕘</div>
          <div>
            <strong>Historique</strong>
            <span>Preuves par date et type</span>
          </div>
          <b>›</b>
        </button>

        <button class="quick-card red" type="button" (click)="go('/fridges')">
          <div class="icon-circle red-bg">🔔</div>
          <div>
            <strong>Alertes température</strong>
            <span>Surveillance des écarts</span>
          </div>
          <b>›</b>
        </button>
      </section>

      <section class="kpi-grid" *ngIf="stats">
        <div class="kpi-card">
          <div class="kpi-icon blue-bg">🧊</div>
          <div>
            <span>Frigos</span>
            <strong>{{ stats.fridges }}</strong>
            <small>À contrôler</small>
          </div>
        </div>

        <div class="kpi-card">
          <div class="kpi-icon green-bg">✅</div>
          <div>
            <span>Traçabilité aujourd'hui</span>
            <strong class="green-text">{{ stats.traceabilityToday }}</strong>
            <small>Enregistrée(s)</small>
          </div>
        </div>

        <div class="kpi-card">
          <div class="kpi-icon orange-bg">🧴</div>
          <div>
            <span>Nettoyages en retard</span>
            <strong class="orange-text">{{ stats.lateCleaning }}</strong>
            <small>À effectuer</small>
          </div>
        </div>

        <div class="kpi-card">
          <div class="kpi-icon red-bg">🌡️</div>
          <div>
            <span>Alertes température</span>
            <strong class="red-text">{{ stats.temperatureAlerts }}</strong>
            <small>Actives</small>
          </div>
        </div>
      </section>

      <section class="priority-card" *ngIf="stats">
        <h2>Priorités du jour</h2>

        <div class="priority-ok" *ngIf="stats.temperatureAlerts === 0 && stats.lateCleaning === 0">
          <div class="ok-icon">✓</div>
          <div>
            <strong>Situation normale</strong>
            <span>Aucune priorité critique détectée.</span>
          </div>
          <div class="shield">✅</div>
        </div>

        <div class="priority-alert red-soft" *ngIf="stats.temperatureAlerts > 0">
          <strong>Alertes température</strong>
          <span>{{ stats.temperatureAlerts }} alerte(s) active(s)</span>
          <button type="button" (click)="go('/fridges')">Voir</button>
        </div>

        <div class="priority-alert orange-soft" *ngIf="stats.lateCleaning > 0">
          <strong>Nettoyages en retard</strong>
          <span>{{ stats.lateCleaning }} tâche(s) à effectuer</span>
          <button type="button" (click)="go('/cleaning-zones')">Voir</button>
        </div>
      </section>

    </section>
  `,
  styles: [`
    .dashboard-page {
      display: grid;
      gap: 20px;
    }

    .dashboard-head h1 {
      margin: 0;
      font-size: 32px;
      font-weight: 900;
      color: #08264a;
      letter-spacing: -0.5px;
    }

    .dashboard-head p {
      margin: 6px 0 0;
      color: #51627a;
      font-size: 16px;
      font-weight: 600;
    }

    .quick-grid {
      display: grid;
      grid-template-columns: repeat(5, minmax(0, 1fr));
      gap: 16px;
    }

    .quick-card {
      min-height: 176px;
      border: 1px solid #dfe9f5;
      background: #fff;
      border-radius: 18px;
      padding: 24px;
      text-align: left;
      cursor: pointer;
      box-shadow: 0 10px 26px rgba(15, 76, 129, .08);
      position: relative;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      overflow: hidden;
      transition: .18s ease;
    }

    .quick-card:hover {
      transform: translateY(-3px);
      box-shadow: 0 18px 36px rgba(15, 76, 129, .14);
    }

    .quick-card::after {
      content: '';
      position: absolute;
      left: 0;
      right: 0;
      bottom: 0;
      height: 4px;
      background: #0f6fe5;
    }

    .quick-card.green::after { background: #12b76a; }
    .quick-card.amber::after { background: #ff8a00; }
    .quick-card.purple::after { background: #6938ef; }
    .quick-card.red::after { background: #e11d48; }

    .quick-card strong {
      display: block;
      color: #08264a;
      font-size: 18px;
      font-weight: 900;
      margin-bottom: 9px;
    }

    .quick-card span {
      color: #51627a;
      font-size: 15px;
      line-height: 1.45;
      font-weight: 600;
    }

    .quick-card b {
      position: absolute;
      right: 24px;
      top: 32px;
      font-size: 32px;
      color: #385474;
      font-weight: 400;
    }

    .icon-circle {
      width: 72px;
      height: 72px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 32px;
      margin-bottom: 16px;
    }

    .blue-bg { background: #e8f2ff; }
    .pink-bg { background: #ffe0f2; }
    .amber-bg { background: #fff0d8; }
    .purple-bg { background: #efe6ff; }
    .red-bg { background: #ffe0e5; }
    .green-bg { background: #e5f8ed; }
    .orange-bg { background: #fff1dd; }

    .kpi-grid {
      display: grid;
      grid-template-columns: repeat(4, minmax(0, 1fr));
      gap: 16px;
    }

    .kpi-card {
      background: white;
      border: 1px solid #dfe9f5;
      border-radius: 18px;
      padding: 24px;
      box-shadow: 0 10px 26px rgba(15, 76, 129, .07);
      display: flex;
      align-items: center;
      gap: 22px;
      min-height: 128px;
    }

    .kpi-icon {
      width: 76px;
      height: 76px;
      min-width: 76px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 34px;
    }

    .kpi-card span {
      color: #51627a;
      font-size: 16px;
      font-weight: 700;
      display: block;
    }

    .kpi-card strong {
      color: #08264a;
      font-size: 34px;
      line-height: 1;
      margin: 10px 0 6px;
      display: block;
      font-weight: 900;
    }

    .kpi-card small {
      color: #51627a;
      font-size: 15px;
      font-weight: 600;
    }

    .green-text { color: #079455 !important; }
    .orange-text { color: #ff8a00 !important; }
    .red-text { color: #d92d20 !important; }

    .priority-card {
      background: white;
      border: 1px solid #dfe9f5;
      border-radius: 18px;
      padding: 20px 24px;
      box-shadow: 0 10px 26px rgba(15, 76, 129, .07);
    }

    .priority-card h2 {
      color: #08264a;
      margin: 0 0 16px;
      font-size: 22px;
      font-weight: 900;
    }

    .priority-ok {
      background: linear-gradient(90deg, #eafaf1, #f4fff8);
      border-radius: 16px;
      min-height: 82px;
      display: flex;
      align-items: center;
      gap: 20px;
      padding: 18px;
      position: relative;
      overflow: hidden;
    }

    .ok-icon {
      width: 56px;
      height: 56px;
      border-radius: 50%;
      background: #12b76a;
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 34px;
      font-weight: 900;
      box-shadow: 0 10px 20px rgba(18,183,106,.25);
    }

    .priority-ok strong {
      display: block;
      color: #079455;
      font-size: 19px;
      font-weight: 900;
      margin-bottom: 4px;
    }

    .priority-ok span {
      color: #08264a;
      font-size: 15px;
      font-weight: 600;
    }

    .shield {
      margin-left: auto;
      font-size: 58px;
      opacity: .9;
    }

    .priority-alert {
      border-radius: 14px;
      padding: 15px;
      display: grid;
      grid-template-columns: 220px 1fr auto;
      align-items: center;
      gap: 12px;
      margin-top: 10px;
      font-weight: 800;
    }

    .priority-alert button {
      border: none;
      background: white;
      border-radius: 10px;
      padding: 9px 13px;
      font-weight: 900;
      cursor: pointer;
    }

    .red-soft {
      background: #fff1f3;
      color: #b42318;
    }

    .orange-soft {
      background: #fff7ed;
      color: #c2410c;
    }

    @media (max-width: 1200px) {
      .quick-grid {
        grid-template-columns: repeat(2, minmax(0, 1fr));
      }

      .kpi-grid {
        grid-template-columns: repeat(2, minmax(0, 1fr));
      }
    }

    @media (max-width: 700px) {
      .dashboard-head h1 {
        font-size: 26px;
      }

      .quick-grid,
      .kpi-grid {
        grid-template-columns: 1fr;
      }

      .quick-card {
        min-height: 140px;
      }

      .priority-alert {
        grid-template-columns: 1fr;
      }

      .shield {
        display: none;
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