import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { BaseChartDirective } from 'ng2-charts';

import {
  Chart,
  CategoryScale,
  LinearScale,
  LineController,
  LineElement,
  PointElement,
  Filler,
  Tooltip,
  Legend,
  ChartData,
  ChartOptions
} from 'chart.js';

import {
  ApiService,
  TemperatureHistoryItem
} from '../../core/api.service';

Chart.register(
  CategoryScale,
  LinearScale,
  LineController,
  LineElement,
  PointElement,
  Filler,
  Tooltip,
  Legend
);

type TemperaturePeriod = 'DAY' | 'WEEK' | 'MONTH' | 'YEAR';

@Component({
  selector: 'app-temperature-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    BaseChartDirective
  ],
  template: `
    <section class="dashboard-page">

      <div class="top-bar">
        <div>
          <h1>Courbe température</h1>
          <p>Historique automatique du frigo</p>
        </div>

        <button type="button" class="back-btn" (click)="goBack()">
          ← Retour
        </button>
      </div>

      <div class="period-tabs">
        <button type="button" [class.active]="period === 'DAY'" (click)="changePeriod('DAY')">
          Jour
        </button>

        <button type="button" [class.active]="period === 'WEEK'" (click)="changePeriod('WEEK')">
          Semaine
        </button>

        <button type="button" [class.active]="period === 'MONTH'" (click)="changePeriod('MONTH')">
          Mois
        </button>

        <button type="button" [class.active]="period === 'YEAR'" (click)="changePeriod('YEAR')">
          Année
        </button>
      </div>

      <div class="loading-card" *ngIf="loading">
        Chargement...
      </div>

      <div class="empty-card" *ngIf="!loading && !history.length">
        Aucun relevé automatique disponible pour cette période.
      </div>

      <div class="chart-card" *ngIf="!loading && history.length">

        <div class="stats-grid">

          <div class="stat-box" [ngClass]="temperatureStatus(latestTemperature)">
            <span>Dernière</span>
            <strong>{{ latestTemperature }} °C</strong>
          </div>

          <div class="stat-box">
            <span>Minimum</span>
            <strong>{{ minTemperature }} °C</strong>
          </div>

          <div class="stat-box">
            <span>Maximum</span>
            <strong>{{ maxTemperature }} °C</strong>
          </div>

          <div class="stat-box">
            <span>Moyenne</span>
            <strong>{{ avgTemperature }} °C</strong>
          </div>

        </div>

        <div class="chart-wrapper">
          <canvas
            baseChart
            [type]="'line'"
            [data]="lineChartData"
            [options]="lineChartOptions">
          </canvas>
        </div>

      </div>

      <div class="history-card" *ngIf="!loading && history.length">
        <h3>Historique automatique</h3>

        <div
          class="history-row"
          *ngFor="let item of history"
          [ngClass]="temperatureStatus(item.temperature)"
        >
          <div>
            <strong>{{ item.temperature }} °C</strong>
            <p>{{ formatDate(item.createdAt) }}</p>
          </div>

          <div class="source-badge">
            Automatique
          </div>
        </div>
      </div>

    </section>
  `,
  styles: [`
    .dashboard-page {
      padding: 24px;
      display: flex;
      flex-direction: column;
      gap: 20px;
    }

.top-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

    .top-bar h1 {
      margin: 0;
      font-size: 28px;
      font-weight: 900;
      color: #0f172a;
    }

    .top-bar p {
      margin: 4px 0 0;
      color: #64748b;
    }

.back-btn {
  border: none;
  background: linear-gradient(135deg, #0f4c81, #1d4ed8);
  color: white;

  padding: 10px 16px;

  border-radius: 12px;

  cursor: pointer;

  font-weight: 800;

  font-size: 14px;

  min-width: auto;

  width: auto;

  display: inline-flex;

  align-items: center;

  justify-content: center;

  gap: 6px;

  box-shadow: 0 10px 20px rgba(37, 99, 235, .18);

  transition: all .18s ease;
}

.back-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 14px 24px rgba(37, 99, 235, .24);
}

  .period-tabs {
    display: inline-flex;
    align-self: flex-start;
    gap: 6px;
    background: #ffffff;
    border: 1px solid #e2e8f0;
    border-radius: 999px;
    padding: 6px;
    box-shadow: 0 12px 28px rgba(15, 23, 42, .08);
  }

  .period-tabs button {
    border: none;
    border-radius: 999px;
    padding: 10px 18px;
    background: transparent;
    color: #64748b;
    font-weight: 900;
    cursor: pointer;
    min-width: 95px;
    transition: all .18s ease;
  }

  .period-tabs button:hover {
    background: #f1f5f9;
    color: #0f4c81;
  }

  .period-tabs button.active {
    background: linear-gradient(135deg, #0f4c81, #2563eb);
    color: white;
    box-shadow: 0 8px 18px rgba(37, 99, 235, .28);
  }

  @media (max-width: 700px) {
    .period-tabs {
      width: 100%;
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      border-radius: 22px;
    }

    .period-tabs button {
      min-width: 0;
    }
  }

    .chart-card,
    .history-card,
    .loading-card,
    .empty-card {
      background: white;
      border-radius: 24px;
      padding: 24px;
      box-shadow: 0 10px 30px rgba(15,23,42,.08);
    }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit,minmax(160px,1fr));
      gap: 16px;
      margin-bottom: 24px;
    }

    .stat-box {
      background: #f8fafc;
      border-radius: 18px;
      padding: 16px;
      display: flex;
      flex-direction: column;
      gap: 8px;
      border: 1px solid #e2e8f0;
    }

    .stat-box.good {
      background: #f0fdf4;
      border-color: #86efac;
    }

    .stat-box.warning {
      background: #fffbeb;
      border-color: #fbbf24;
    }

    .stat-box.danger {
      background: #fef2f2;
      border-color: #fca5a5;
    }

    .stat-box span {
      color: #64748b;
      font-size: 13px;
      font-weight: 800;
    }

    .stat-box strong {
      font-size: 26px;
      color: #0f172a;
    }

    .chart-wrapper {
      height: 360px;
      width: 100%;
    }

    .history-card h3 {
      margin-top: 0;
      margin-bottom: 18px;
      color: #0f172a;
    }

    .history-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 14px 16px;
      border-bottom: 1px solid #e2e8f0;
      border-left: 6px solid transparent;
      border-radius: 14px;
      margin-bottom: 8px;
    }

    .history-row:last-child {
      border-bottom: none;
    }

    .history-row.good {
      border-left-color: #16a34a;
      background: #f0fdf4;
    }

    .history-row.warning {
      border-left-color: #f59e0b;
      background: #fffbeb;
    }

    .history-row.danger {
      border-left-color: #dc2626;
      background: #fef2f2;
    }

    .history-row p {
      margin: 4px 0 0;
      color: #64748b;
      font-size: 13px;
    }

    .source-badge {
      background: #dbeafe;
      color: #1d4ed8;
      padding: 8px 12px;
      border-radius: 999px;
      font-size: 12px;
      font-weight: 800;
    }

    @media (max-width: 700px) {
      .dashboard-page {
        padding: 14px;
      }

      .period-tabs button {
        flex: 1;
      }

      .chart-wrapper {
        height: 300px;
      }
    }
  `]
})
export class TemperatureDashboardComponent implements OnInit {
  private readonly api = inject(ApiService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  period: TemperaturePeriod = 'DAY';
  fridgeId = 0;
  loading = true;

  history: TemperatureHistoryItem[] = [];

  latestTemperature = 0;
  minTemperature = 0;
  maxTemperature = 0;
  avgTemperature = 0;

  lineChartData: ChartData<'line'> = {
    labels: [],
    datasets: [
      {
        data: [],
        label: 'Température °C',
        tension: 0.35,
        fill: true
      }
    ]
  };

  lineChartOptions: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        beginAtZero: false
      }
    },
    plugins: {
      legend: {
        display: true
      }
    }
  };

  ngOnInit(): void {
    this.fridgeId = Number(this.route.snapshot.paramMap.get('id'));

    if (!this.fridgeId) {
      this.loading = false;
      return;
    }

    this.loadHistory();
  }

  changePeriod(value: TemperaturePeriod): void {
    this.period = value;
    this.loadHistory();
  }

  loadHistory(): void {
    this.loading = true;
    this.resetChart();

    this.api.getFridgeTemperatureHistory(this.fridgeId, this.period).subscribe({
      next: (data: TemperatureHistoryItem[]) => {
        const automaticData = data.filter(
          item => item.source === 'SHELLY_AUTOMATIC'
        );

        this.history = automaticData;
        this.buildChart(automaticData);
        this.loading = false;
      },
      error: () => {
        this.history = [];
        this.loading = false;
      }
    });
  }

  buildChart(data: TemperatureHistoryItem[]): void {
    if (!data.length) {
      this.resetChart();
      return;
    }

    const temperatures = data.map(item => Number(item.temperature));

    this.latestTemperature = temperatures[temperatures.length - 1];
    this.minTemperature = Math.min(...temperatures);
    this.maxTemperature = Math.max(...temperatures);

    this.avgTemperature = Number(
      (
        temperatures.reduce((sum, value) => sum + value, 0)
        / temperatures.length
      ).toFixed(1)
    );

    const colors = temperatures.map(temp => this.temperatureColor(temp));

    this.lineChartData = {
      labels: data.map(item => this.formatLabel(item.createdAt)),
      datasets: [
        {
          data: temperatures,
          label: 'Température °C',
          tension: 0.35,
          fill: true,
          borderColor: '#2563eb',
          backgroundColor: 'rgba(37,99,235,0.12)',
          pointBackgroundColor: colors,
          pointBorderColor: colors,
          pointRadius: 6,
          pointHoverRadius: 8,
          borderWidth: 3
        }
      ]
    };
  }

  resetChart(): void {
    this.latestTemperature = 0;
    this.minTemperature = 0;
    this.maxTemperature = 0;
    this.avgTemperature = 0;

    this.lineChartData = {
      labels: [],
      datasets: [
        {
          data: [],
          label: 'Température °C',
          tension: 0.35,
          fill: true
        }
      ]
    };
  }

  temperatureStatus(value: number): 'good' | 'warning' | 'danger' {
    const temp = Number(value);

    if (temp <= 4) {
      return 'good';
    }

    if (temp <= 8) {
      return 'warning';
    }

    return 'danger';
  }

  temperatureColor(value: number): string {
    const status = this.temperatureStatus(value);

    if (status === 'good') {
      return '#16a34a';
    }

    if (status === 'warning') {
      return '#f59e0b';
    }

    return '#dc2626';
  }

  formatLabel(date: string): string {
    if (this.period === 'DAY') {
      return this.formatHour(date);
    }

    if (this.period === 'WEEK') {
      return new Date(date).toLocaleDateString('fr-FR', {
        weekday: 'short',
        day: '2-digit'
      });
    }

    if (this.period === 'MONTH') {
      return new Date(date).toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: '2-digit'
      });
    }

    return new Date(date).toLocaleDateString('fr-FR', {
      month: 'short',
      year: '2-digit'
    });
  }

  formatHour(date: string): string {
    return new Date(date).toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  formatDate(date: string): string {
    return new Date(date).toLocaleString('fr-FR');
  }

  goBack(): void {
    this.router.navigate(['/fridges']);
  }
}