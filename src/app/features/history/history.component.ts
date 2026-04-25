import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService, CleaningProof, FridgeProof, Invoice, TraceabilityProof } from '../../core/api.service';

type HistoryItem = {
  date: string;
  type: string;
  title: string;
  createdBy: string;
  comment: string;
  photosCount: number;
};

@Component({
  standalone: true,
  imports: [CommonModule],
  template: `
    <section class="page-top">
      <div>
        <h1>Historique des preuves</h1>
        <p>Toutes les preuves HACCP classées par date et par type.</p>
      </div>
    </section>

    <div class="history-filters">
      <button class="chip" [class.active]="filter === 'ALL'" (click)="filter='ALL'">Tout</button>
      <button class="chip" [class.active]="filter === 'FRIDGE'" (click)="filter='FRIDGE'">Frigo</button>
      <button class="chip" [class.active]="filter === 'CLEANING'" (click)="filter='CLEANING'">Nettoyage</button>
      <button class="chip" [class.active]="filter === 'TRACEABILITY'" (click)="filter='TRACEABILITY'">Traçabilité</button>
    </div>

    <div class="cards-grid">
      <div class="entity-card" *ngFor="let item of filteredHistory()">
        <div class="entity-head">
          <div>
            <strong>{{ item.title }}</strong>
            <p class="entity-subtitle">{{ item.type }}</p>
          </div>
          <span class="badge">{{ item.date }}</span>
        </div>
        <div class="trace-meta-grid">
          <div><span>Par</span><strong>{{ item.createdBy }}</strong></div>
          <div><span>Photos</span><strong>{{ item.photosCount }}</strong></div>
        </div>
        <p>{{ item.comment || '-' }}</p>
      </div>
    </div>
  `
})
export class HistoryComponent implements OnInit {
  private api = inject(ApiService);
  history: HistoryItem[] = [];
  filter: 'ALL' | 'FRIDGE' | 'CLEANING' | 'TRACEABILITY' = 'ALL';

  ngOnInit(): void {
    this.loadFridges();
    this.loadCleaning();
    this.loadTraceability();
  }

  filteredHistory(): HistoryItem[] {
    if (this.filter === 'ALL') return this.history;
    if (this.filter === 'FRIDGE') return this.history.filter(x => x.type === 'Preuve frigo');
    if (this.filter === 'CLEANING') return this.history.filter(x => x.type === 'Preuve nettoyage');
    return this.history.filter(x => x.type === 'Preuve traçabilité');
  }

  private push(items: HistoryItem[]): void {
    this.history = [...this.history, ...items].sort((a, b) => (b.date || '').localeCompare(a.date || ''));
  }

  private loadFridges(): void {
    this.api.getFridges().subscribe(fridges => {
      fridges.forEach(fridge => {
        if (!fridge.id) return;
        this.api.getFridgeProofs(fridge.id).subscribe((proofs: FridgeProof[]) => {
          this.push(proofs.map(p => ({
            date: p.createdAt || '',
            type: 'Preuve frigo',
            title: fridge.name,
            createdBy: p.createdBy,
            comment: p.comment || '',
            photosCount: p.photos?.length || 0
          })));
        });
      });
    });
  }

  private loadCleaning(): void {
    this.api.getCleaningZones().subscribe(zones => {
      zones.forEach(zone => {
        if (!zone.id) return;
        this.api.getCleaningProofs(zone.id).subscribe((proofs: CleaningProof[]) => {
          this.push(proofs.map(p => ({
            date: p.createdAt || '',
            type: 'Preuve nettoyage',
            title: zone.name,
            createdBy: p.createdBy,
            comment: p.comment || '',
            photosCount: p.photos?.length || 0
          })));
        });
      });
    });
  }

  private loadTraceability(): void {
    this.api.getInvoices().subscribe((invoices: Invoice[]) => {
      invoices.forEach(invoice => {
        if (!invoice.id) return;
        this.api.getTraceabilityProofs(invoice.id).subscribe((proofs: TraceabilityProof[]) => {
          this.push(proofs.map(p => ({
            date: p.createdAt || '',
            type: 'Preuve traçabilité',
            title: invoice.supplierName,
            createdBy: p.createdBy,
            comment: p.comment || '',
            photosCount: p.photos?.length || 0
          })));
        });
      });
    });
  }
}
