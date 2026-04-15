import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService, CleaningAlert } from '../../core/api.service';

@Component({
  standalone: true,
  imports: [CommonModule],
  template: `
    <section class="page-top">
      <div><h1>Alertes nettoyage</h1><p>Nettoyages en retard ou non réalisés.</p></div>
    </section>

    <div class="cards-grid">
      <div class="entity-card" *ngFor="let alert of alerts">
        <div class="entity-head">
          <strong>{{ alert.cleaningZone?.name || 'Zone' }}</strong>
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
export class CleaningAlertsComponent implements OnInit {
  private api = inject(ApiService);
  alerts: CleaningAlert[] = [];
  ngOnInit(): void { this.api.getCleaningAlerts().subscribe(a => this.alerts = a); }
}
