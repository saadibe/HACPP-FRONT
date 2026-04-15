import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService, FridgeAlert } from '../../core/api.service';

@Component({
  standalone: true,
  imports: [CommonModule],
  template: `
    <section class="page-top">
      <div><h1>Alertes frigos</h1><p>Relevés manquants et températures hors plage.</p></div>
    </section>

    <div class="cards-grid">
      <div class="entity-card" *ngFor="let alert of alerts">
        <div class="entity-head">
          <strong>{{ alert.fridge?.name || 'Frigo' }}</strong>
          <span class="badge" [class.red]="alert.status === 'OPEN'">{{ alert.status }}</span>
        </div>
        <p><strong>Type :</strong> {{ alert.alertType }}</p>
        <p><strong>Prévu :</strong> {{ alert.expectedAt }}</p>
        <p><strong>Créée :</strong> {{ alert.createdAt }}</p>
        <p *ngIf="alert.resolvedAt"><strong>Résolue :</strong> {{ alert.resolvedAt }}</p>
      </div>
    </div>
  `
})
export class FridgeAlertsComponent implements OnInit {
  private api = inject(ApiService);
  alerts: FridgeAlert[] = [];
  ngOnInit(): void { this.api.getFridgeAlerts().subscribe(a => this.alerts = a); }
}
