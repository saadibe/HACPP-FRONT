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

      <div class="top-header">

        <div class="header-left">
          <h1>{{ fridgeName || 'Frigo HACCP' }}</h1>

          <div class="sub-line">
            <span class="online-dot"></span>
            <span>Historique automatique Shelly HACCP</span>
          </div>
        </div>

        <button type="button" class="back-btn" (click)="goBack()">
          ← Retour
        </button>

      </div>

      <div class="filters-wrapper">

        <div class="period-tabs">

          <button
            type="button"
            [class.active]="period === 'DAY'"
            (click)="changePeriod('DAY')"
          >
            📅 Jour
          </button>

          <button
            type="button"
            [class.active]="period === 'WEEK'"
            (click)="changePeriod('WEEK')"
          >
            📆 Semaine
          </button>

          <button
            type="button"
            [class.active]="period === 'MONTH'"
            (click)="changePeriod('MONTH')"
          >
            🗓️ Mois
          </button>

          <button
            type="button"
            [class.active]="period === 'YEAR'"
            (click)="changePeriod('YEAR')"
          >
            🗓️ Année
          </button>

        </div>

        <div class="interval-tabs">

          <button
            type="button"
            [class.active]="intervalMinutes === 5"
            (click)="changeInterval(5)"
          >
            🕘 5 min
          </button>

          <button
            type="button"
            [class.active]="intervalMinutes === 60"
            (click)="changeInterval(60)"
          >
            🕘 1 h
          </button>

          <button
            type="button"
            [class.active]="intervalMinutes === 120"
            (click)="changeInterval(120)"
          >
            🕘 2 h
          </button>

        </div>

      </div>

      <div class="loading-card" *ngIf="loading">
        Chargement...
      </div>

      <div class="empty-card" *ngIf="!loading && !history.length">
        Aucun relevé disponible.
      </div>

      <ng-container *ngIf="!loading && history.length">

        <div class="stats-grid">

          <div
            class="stat-card"
            [ngClass]="temperatureStatus(latestTemperature)"
          >
            <div class="stat-label">
              🌡️ Dernière température
            </div>

            <div class="stat-value">
              {{ latestTemperature }} °C
            </div>
          </div>

          <div class="stat-card battery">
            <div class="stat-label">
              🔋 État batterie
            </div>

            <div class="stat-value">
              {{ latestBatteryPercent ?? '--' }} %
            </div>
          </div>



        </div>

        <div class="average-card">

          <div>
            <div class="average-label">
              Température moyenne
            </div>

            <div class="average-value">
              {{ avgTemperature }} °C
            </div>
          </div>

          <div class="divider"></div>

          <div>
            <div class="average-label">
              Relevés
            </div>

            <div class="average-value small">
              {{ groupedHistory.length }}
            </div>
          </div>

        </div>

        <div class="chart-card">

          <div class="chart-title">
            Courbe de température
            <span>(toutes les {{ intervalLabel }})</span>
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

        <div class="history-card">

          <div class="history-head">
            <h3>Derniers relevés</h3>
          </div>

          <div
            class="history-row"
            *ngFor="let item of history.slice().reverse().slice(0,20)"
          >

            <div class="history-left">

              <div
                class="temp-circle"
                [ngClass]="temperatureStatus(item.temperature)"
              >
                {{ item.temperature }}°
              </div>

              <div>
                <strong>{{ formatDate(item.createdAt) }}</strong>

                <p>Automatique Shelly</p>
              </div>

            </div>

            <div class="battery-mini">
              🔋 {{ item.batteryPercent ?? '--' }} %
            </div>

          </div>

        </div>

      </ng-container>

    </section>
  `,

  styles: [`

    .dashboard-page {
      padding: 20px;
      display: flex;
      flex-direction: column;
      gap: 20px;
      background: #eef4fb;
      min-height: 100vh;
    }

    .top-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 16px;
      flex-wrap: wrap;
    }

    .header-left h1 {
      margin: 0;
      font-size: 32px;
      font-weight: 700;
      color: #0f172a;
    }

    .sub-line {
      margin-top: 8px;
      display: flex;
      align-items: center;
      gap: 8px;
      color: #64748b;
      font-size: 16px;
      font-weight: 600;
    }

    .online-dot {
      width: 12px;
      height: 12px;
      border-radius: 50%;
      background: #22c55e;
      display: block;
    }

    .back-btn {
      border: none !important;
      width: auto !important;
      background: linear-gradient(135deg,#0f4c81,#0066d6) !important;
      color: white !important;
      padding: 14px 22px !important;
      border-radius: 18px !important;
      font-size: 16px !important;
      font-weight: 700 !important;
      cursor: pointer !important;
      box-shadow: 0 12px 24px rgba(0,102,214,.20);
    }

    .filters-wrapper {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .period-tabs,
    .interval-tabs {
      background: white !important;
      border-radius: 24px !important;
      padding: 10px !important;
      display: grid !important;
      gap: 10px !important;
      box-shadow: 0 12px 30px rgba(15,23,42,.08) !important;
    }

    .period-tabs {
      grid-template-columns: repeat(4,1fr) !important;
    }

    .interval-tabs {
      grid-template-columns: repeat(3,1fr) !important;
    }

    .period-tabs button,
    .interval-tabs button {
      border: none !important;
      border-radius: 18px !important;
      background: #f8fafc !important;
      color: #243b5a !important;
      padding: 16px 12px !important;
      font-weight: 700 !important;
      font-size: 17px !important;
      cursor: pointer !important;
    }

    .period-tabs button.active,
    .interval-tabs button.active {
      background: linear-gradient(135deg,#0f4c81,#0066d6) !important;
      color: white !important;
      box-shadow: 0 10px 24px rgba(0,102,214,.24) !important;
    }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(4,1fr);
      gap: 16px;
    }

    .stat-card {
      background: white;
      border-radius: 28px;
      padding: 22px;
      box-shadow: 0 10px 30px rgba(15,23,42,.06);
      border: 2px solid #e2e8f0;
    }

    .stat-card.good {
      background: #f0fdf4;
      border-color: #bbf7d0;
    }

    .stat-card.warning {
      background: #fff7ed;
      border-color: #fed7aa;
    }

    .stat-card.danger {
      background: #fef2f2;
      border-color: #fecaca;
    }

    .stat-card.battery {
      background: #eff6ff;
      border-color: #bfdbfe;
    }

    .stat-label {
      color: #64748b;
      font-size: 15px;
      font-weight: 800;
      margin-bottom: 16px;
    }

    .stat-value {
      font-size: 46px;
      font-weight: 700;
      color: #0f172a;
    }

    .average-card {
      background: white;
      border-radius: 30px;
      padding: 28px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 20px;
      box-shadow: 0 10px 30px rgba(15,23,42,.06);
    }

    .average-label {
      color: #64748b;
      font-size: 16px;
      font-weight: 700;
      margin-bottom: 8px;
    }

    .average-value {
      font-size: 44px;
      font-weight: 700;
      color: #0f172a;
    }

    .average-value.small {
      font-size: 36px;
    }

    .divider {
      width: 1px;
      align-self: stretch;
      background: #e2e8f0;
    }

    .chart-card,
    .history-card,
    .loading-card,
    .empty-card {
      background: white;
      border-radius: 30px;
      padding: 28px;
      box-shadow: 0 10px 30px rgba(15,23,42,.06);
    }

    .chart-title {
      font-size: 28px;
      font-weight: 700;
      margin-bottom: 22px;
      color: #0f172a;
    }

    .chart-title span {
      color: #64748b;
      font-size: 18px;
    }

    .chart-wrapper {
      height: 420px;
    }

    .history-head {
      margin-bottom: 18px;
    }

    .history-head h3 {
      margin: 0;
      font-size: 30px;
      color: #0f172a;
    }

    .history-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 16px 0;
      border-bottom: 1px solid #e2e8f0;
    }

    .history-left {
      display: flex;
      align-items: center;
      gap: 14px;
    }

    .temp-circle {
      width: 74px;
      height: 74px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 22px;
      font-weight: 700;
    }

    .temp-circle.good {
      background: #dcfce7;
      color: #15803d;
    }

    .temp-circle.warning {
      background: #fef3c7;
      color: #d97706;
    }

    .temp-circle.danger {
      background: #fee2e2;
      color: #dc2626;
    }

    .history-left strong {
      color: #0f172a;
      font-size: 18px;
    }

    .history-left p {
      margin: 6px 0 0;
      color: #64748b;
      font-size: 14px;
    }

    .battery-mini {
      color: #16a34a;
      font-size: 20px;
      font-weight: 700;
      white-space: nowrap;
    }

    @media (max-width: 900px) {

      .stats-grid {
        grid-template-columns: repeat(2,1fr);
      }

      .period-tabs {
        grid-template-columns: repeat(2,1fr) !important;
      }

      .chart-wrapper {
        height: 320px;
      }

      .header-left h1 {
        font-size: 28px;
      }
    }

    @media (max-width: 700px) {

      .dashboard-page {
        padding: 14px;
      }

      .stats-grid {
        grid-template-columns: 1fr 1fr;
      }

      .interval-tabs {
        grid-template-columns: repeat(3,1fr) !important;
      }

      .period-tabs button,
      .interval-tabs button {
        min-width: 0;
        padding: 12px 6px !important;
        font-size: 15px !important;
      }

      .stat-value {
        font-size: 28px;
      }

      .average-value {
        font-size: 30px;
      }

      .average-card {
        flex-direction: column;
        align-items: flex-start;
      }

      .divider {
        width: 100%;
        height: 1px;
      }

      .history-row {
        gap: 12px;
      }

      .temp-circle {
        width: 56px;
        height: 56px;
        font-size: 18px;
      }

      .battery-mini {
        font-size: 16px;
      }
    }

  `]
})
export class TemperatureDashboardComponent implements OnInit {

  private readonly api = inject(ApiService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  fridgeId = 0;
  fridgeName = '';

  loading = true;

  period: TemperaturePeriod = 'DAY';
  intervalMinutes = 120;

  history: TemperatureHistoryItem[] = [];
  groupedHistory: TemperatureHistoryItem[] = [];

  latestTemperature = 0;
  minTemperature = 0;
  maxTemperature = 0;
  avgTemperature = 0;

  latestBatteryPercent?: number;

  lineChartData: ChartData<'line'> = {
    labels: [],
    datasets: []
  };

  lineChartOptions: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,

    plugins: {
      legend: {
        display: false
      }
    },

    scales: {
      y: {
        beginAtZero: false,
        ticks: {
          color: '#64748b'
        },
        grid: {
          color: '#e2e8f0'
        }
      },

      x: {
        ticks: {
          color: '#64748b'
        },
        grid: {
          color: '#f1f5f9'
        }
      }
    }
  };

  ngOnInit(): void {

    this.fridgeId =
      Number(this.route.snapshot.paramMap.get('id'));

    if (!this.fridgeId) {
      this.loading = false;
      return;
    }

    this.loadFridgeName();
    this.loadHistory();
  }

  get intervalLabel(): string {

    if (this.intervalMinutes === 5) {
      return '5 min';
    }

    if (this.intervalMinutes === 60) {
      return '1h';
    }

    return '2h';
  }

  loadFridgeName(): void {

    this.api.getFridges().subscribe({
      next: (fridges: Fridge[]) => {

        const fridge =
          fridges.find(f => f.id === this.fridgeId);

        this.fridgeName =
          fridge?.name || 'Frigo HACCP';
      }
    });
  }

  changePeriod(period: TemperaturePeriod): void {
    this.period = period;
    this.loadHistory();
  }

  changeInterval(value: number): void {
    this.intervalMinutes = value;
    this.buildChart(this.history);
  }

  loadHistory(): void {

    this.loading = true;

    this.api
      .getFridgeTemperatureHistory(
        this.fridgeId,
        this.period
      )
      .subscribe({

        next: (data: TemperatureHistoryItem[]) => {

          this.history =
            data.filter(
              x => x.source === 'SHELLY_AUTOMATIC'
            );

          this.buildChart(this.history);

          this.loading = false;
        },

        error: () => {

          this.loading = false;
          this.history = [];
        }
      });
  }

  buildChart(data: TemperatureHistoryItem[]): void {

    if (!data.length) {
      return;
    }

    this.groupedHistory =
      this.groupByInterval(
        data,
        this.intervalMinutes
      );

    const temperatures =
      this.groupedHistory.map(
        x => Number(x.temperature)
      );

    this.latestTemperature =
      temperatures[temperatures.length - 1];

    this.minTemperature =
      Math.min(...temperatures);

    this.maxTemperature =
      Math.max(...temperatures);

    this.avgTemperature = Number(
      (
        temperatures.reduce((a,b)=>a+b,0)
        / temperatures.length
      ).toFixed(1)
    );

    this.latestBatteryPercent =
      this.history[this.history.length - 1]
      ?.batteryPercent;

    const pointColors =
      temperatures.map(
        temp => this.temperatureColor(temp)
      );

    this.lineChartData = {

      labels:
        this.groupedHistory.map(
          x => this.formatLabel(x.createdAt)
        ),

      datasets: [
        {
          data: temperatures,

          tension: 0.4,

          fill: true,

          borderWidth: 4,

          borderColor: '#2563eb',

          backgroundColor:
            'rgba(37,99,235,0.12)',

          pointBackgroundColor:
            pointColors,

          pointBorderColor:
            pointColors,

          pointRadius: 6,

          pointHoverRadius: 8
        }
      ]
    };
  }

  groupByInterval(
    data: TemperatureHistoryItem[],
    intervalMinutes: number
  ): TemperatureHistoryItem[] {

    const grouped =
      new Map<number, TemperatureHistoryItem[]>();

    data.forEach(item => {

      const time =
        new Date(item.createdAt).getTime();

      const bucket =
        Math.floor(
          time /
          (intervalMinutes * 60 * 1000)
        );

      const arr =
        grouped.get(bucket) || [];

      arr.push(item);

      grouped.set(bucket, arr);
    });

    return Array.from(grouped.values())
      .map(items => {

        const avg =
          items.reduce(
            (s,i)=>s+Number(i.temperature),
            0
          ) / items.length;

        return {
          ...items[items.length - 1],
          temperature: Number(avg.toFixed(1))
        };
      });
  }

  temperatureStatus(
    value: number
  ): 'good' | 'warning' | 'danger' {

    if (value <= 4) {
      return 'good';
    }

    if (value <= 8) {
      return 'warning';
    }

    return 'danger';
  }

  temperatureColor(value: number): string {

    const status =
      this.temperatureStatus(value);

    if (status === 'good') {
      return '#22c55e';
    }

    if (status === 'warning') {
      return '#f59e0b';
    }

    return '#ef4444';
  }

  formatLabel(date: string): string {

    if (this.period === 'DAY') {
      return this.formatHour(date);
    }

    if (this.period === 'WEEK') {

      return new Date(date)
        .toLocaleDateString('fr-FR', {
          weekday: 'short',
          day: '2-digit'
        });
    }

    if (this.period === 'MONTH') {

      return new Date(date)
        .toLocaleDateString('fr-FR', {
          day: '2-digit',
          month: '2-digit'
        });
    }

    return new Date(date)
      .toLocaleDateString('fr-FR', {
        month: 'short',
        year: '2-digit'
      });
  }

  formatHour(date: string): string {

    return new Date(date)
      .toLocaleTimeString('fr-FR', {
        hour: '2-digit',
        minute: '2-digit',
        timeZone: 'Europe/Paris'
      });
  }

  formatDate(date: string): string {

    return new Date(date)
      .toLocaleString('fr-FR', {
        timeZone: 'Europe/Paris'
      });
  }

  goBack(): void {
    this.router.navigate(['/fridges']);
  }
}