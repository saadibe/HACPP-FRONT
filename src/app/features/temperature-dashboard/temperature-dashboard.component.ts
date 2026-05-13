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

      <div class="loading-card" *ngIf="loading">
        Chargement...
      </div>

      <div class="empty-card" *ngIf="!loading && !history.length">
        Aucun relevé disponible.
      </div>

      <div class="chart-card" *ngIf="!loading && history.length">

        <div class="stats-grid">

          <div class="stat-box">
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
        <h3>Historique</h3>

        <div class="history-row" *ngFor="let item of history">
          <div>
            <strong>{{ item.temperature }} °C</strong>
            <p>{{ formatDate(item.createdAt) }}</p>
          </div>

          <div class="source-badge">
            {{ item.source || 'AUTO' }}
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
      background: #0f172a;
      color: white;
      padding: 12px 18px;
      border-radius: 14px;
      cursor: pointer;
      font-weight: 800;
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
      padding: 14px 0;
      border-bottom: 1px solid #e2e8f0;
    }

    .history-row:last-child {
      border-bottom: none;
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
  `]
})
export class TemperatureDashboardComponent implements OnInit {
  private readonly api = inject(ApiService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

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

loadHistory(): void {
  this.loading = true;

  this.api.getFridgeTemperatureHistory(this.fridgeId).subscribe({
    next: (data: TemperatureHistoryItem[]) => {
      const automaticData = data.filter(
        x => x.source === 'SHELLY_AUTOMATIC'
      );

      this.history = automaticData;
      this.buildChart(automaticData);
      this.loading = false;
    },
    error: () => {
      this.loading = false;
    }
  });
}

buildChart(data: TemperatureHistoryItem[]): void {

  if (!data.length) {
    return;
  }

  const temperatures =
    data.map(x => Number(x.temperature));

  this.latestTemperature =
    temperatures[temperatures.length - 1];

  this.minTemperature =
    Math.min(...temperatures);

  this.maxTemperature =
    Math.max(...temperatures);

  this.avgTemperature = Number(
    (
      temperatures.reduce((a, b) => a + b, 0)
      / temperatures.length
    ).toFixed(1)
  );

  const colors = temperatures.map(temp => {

    if (temp <= 4) {
      return '#16a34a'; // vert
    }

    if (temp <= 8) {
      return '#f59e0b'; // orange
    }

    return '#dc2626'; // rouge
  });

  this.lineChartData = {
    labels: data.map(x =>
      this.formatHour(x.createdAt)
    ),

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