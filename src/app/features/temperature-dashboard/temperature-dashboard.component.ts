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
  Fridge,
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
  imports: [CommonModule, BaseChartDirective],
  template: `
    <section class="dashboard-page">

      <div class="top-bar">
        <div>
          <h1>{{ fridgeName || 'Courbe température' }}</h1>
          <p>Historique automatique Shelly HACCP</p>
        </div>

        <button type="button" class="back-btn" (click)="goBack()">
          ← Retour
        </button>
      </div>

      <div class="filters-row">
        <div class="period-tabs">
          <button type="button" [class.active]="period === 'DAY'" (click)="changePeriod('DAY')">Jour</button>
          <button type="button" [class.active]="period === 'WEEK'" (click)="changePeriod('WEEK')">Semaine</button>
          <button type="button" [class.active]="period === 'MONTH'" (click)="changePeriod('MONTH')">Mois</button>
          <button type="button" [class.active]="period === 'YEAR'" (click)="changePeriod('YEAR')">Année</button>
        </div>

        <div class="interval-tabs">
          <button type="button" [class.active]="intervalMinutes === 5" (click)="changeInterval(5)">5 min</button>
          <button type="button" [class.active]="intervalMinutes === 60" (click)="changeInterval(60)">1h</button>
          <button type="button" [class.active]="intervalMinutes === 120" (click)="changeInterval(120)">2h</button>
        </div>
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
            <span>Dernière température</span>
            <strong>{{ latestTemperature }} °C</strong>
          </div>

          <div class="stat-box battery-card">
            <span>État batterie</span>
            <strong>🔋 {{ latestBatteryPercent ?? '--' }} %</strong>
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
        <h3>Historique automatique — tous les relevés</h3>

        <div
          class="history-row"
          *ngFor="let item of history"
          [ngClass]="temperatureStatus(item.temperature)"
        >
          <div>
            <strong>{{ item.temperature }} °C</strong>
            <p>{{ formatDate(item.createdAt) }}</p>
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
      width: auto;
      box-shadow: 0 10px 20px rgba(37, 99, 235, .18);
    }

    .filters-row {
      display: flex;
      gap: 12px;
      flex-wrap: wrap;
      align-items: center;
    }

    .period-tabs,
    .interval-tabs {
      display: inline-flex;
      gap: 6px;
      background: #ffffff;
      border: 1px solid #e2e8f0;
      border-radius: 999px;
      padding: 6px;
      box-shadow: 0 12px 28px rgba(15, 23, 42, .08);
    }

    .period-tabs button,
    .interval-tabs button {
      border: none;
      border-radius: 999px;
      padding: 10px 18px;
      background: transparent;
      color: #64748b;
      font-weight: 900;
      cursor: pointer;
      min-width: 86px;
      transition: all .18s ease;
    }

    .period-tabs button.active {
      background: linear-gradient(135deg, #0f4c81, #2563eb);
      color: white;
    }

    .interval-tabs button.active {
      background: linear-gradient(135deg, #16a34a, #22c55e);
      color: white;
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
      grid-template-columns: repeat(auto-fit,minmax(150px,1fr));
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

    .battery-card {
      background: #eff6ff;
      border-color: #93c5fd;
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
      border-left: 6px solid transparent;
      border-radius: 14px;
      margin-bottom: 8px;
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

    .battery-badge {
      background: #dbeafe;
      color: #1d4ed8;
      padding: 8px 12px;
      border-radius: 999px;
      font-size: 12px;
      font-weight: 900;
      white-space: nowrap;
    }

    @media (max-width: 700px) {
      .dashboard-page {
        padding: 14px;
      }

      .filters-row {
        flex-direction: column;
        align-items: stretch;
      }

      .period-tabs,
      .interval-tabs {
        width: 100%;
        display: grid;
        border-radius: 22px;
      }

      .period-tabs {
        grid-template-columns: repeat(2, 1fr);
      }

      .interval-tabs {
        grid-template-columns: repeat(3, 1fr);
      }

      .period-tabs button,
      .interval-tabs button {
        min-width: 0;
        padding: 10px 8px;
      }

      .chart-wrapper {
        height: 300px;
      }

      .history-row {
        align-items: flex-start;
        gap: 10px;
      }
    }
  `]
})
export class TemperatureDashboardComponent implements OnInit {
  private readonly api = inject(ApiService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  period: TemperaturePeriod = 'DAY';
  intervalMinutes = 120;

  fridgeId = 0;
  fridgeName = '';
  loading = true;

  history: TemperatureHistoryItem[] = [];
  groupedHistory: TemperatureHistoryItem[] = [];

  latestTemperature = 0;
  minTemperature = 0;
  maxTemperature = 0;
  avgTemperature = 0;
  latestBatteryPercent?: number;

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

    this.loadFridgeName();
    this.loadHistory();
  }

  loadFridgeName(): void {
    this.api.getFridges().subscribe({
      next: (fridges: Fridge[]) => {
        const fridge = fridges.find(f => f.id === this.fridgeId);
        this.fridgeName = fridge?.name || 'Courbe température';
      }
    });
  }

  changePeriod(value: TemperaturePeriod): void {
    this.period = value;
    this.loadHistory();
  }

  changeInterval(minutes: number): void {
    this.intervalMinutes = minutes;
    this.buildChart(this.history);
  }

  loadHistory(): void {
    this.loading = true;
    this.resetChart();

    this.api.getFridgeTemperatureHistory(this.fridgeId, this.period).subscribe({
      next: (data: TemperatureHistoryItem[]) => {
        this.history = data.filter(item => item.source === 'SHELLY_AUTOMATIC');
        this.buildChart(this.history);
        this.loading = false;
      },
      error: () => {
        this.history = [];
        this.groupedHistory = [];
        this.loading = false;
      }
    });
  }

  buildChart(data: TemperatureHistoryItem[]): void {
    if (!data.length) {
      this.resetChart();
      return;
    }

    this.groupedHistory = this.groupByInterval(data, this.intervalMinutes);

    const temperatures = this.groupedHistory.map(item => Number(item.temperature));

    this.latestTemperature = temperatures[temperatures.length - 1];
    this.minTemperature = Math.min(...temperatures);
    this.maxTemperature = Math.max(...temperatures);
    this.avgTemperature = Number(
      (temperatures.reduce((sum, value) => sum + value, 0) / temperatures.length).toFixed(1)
    );

    this.latestBatteryPercent =
      this.history[this.history.length - 1]?.batteryPercent;

    const colors = temperatures.map(temp => this.temperatureColor(temp));

    this.lineChartData = {
      labels: this.groupedHistory.map(item => this.formatLabel(item.createdAt)),
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
          pointRadius: 5,
          pointHoverRadius: 7,
          borderWidth: 3
        }
      ]
    };
  }

  groupByInterval(
    data: TemperatureHistoryItem[],
    intervalMinutes: number
  ): TemperatureHistoryItem[] {
    const grouped = new Map<number, TemperatureHistoryItem[]>();

    data.forEach(item => {
      const time = new Date(item.createdAt).getTime();
      const bucket = Math.floor(time / (intervalMinutes * 60 * 1000));

      const list = grouped.get(bucket) || [];
      list.push(item);
      grouped.set(bucket, list);
    });

    return Array.from(grouped.values()).map(items => {
      const avg = items.reduce(
        (sum, item) => sum + Number(item.temperature),
        0
      ) / items.length;

      return {
        ...items[items.length - 1],
        temperature: Number(avg.toFixed(1))
      };
    });
  }

  resetChart(): void {
    this.latestTemperature = 0;
    this.minTemperature = 0;
    this.maxTemperature = 0;
    this.avgTemperature = 0;
    this.latestBatteryPercent = undefined;
    this.groupedHistory = [];

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

    if (temp <= 4) return 'good';
    if (temp <= 8) return 'warning';
    return 'danger';
  }

  temperatureColor(value: number): string {
    const status = this.temperatureStatus(value);

    if (status === 'good') return '#16a34a';
    if (status === 'warning') return '#f59e0b';
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