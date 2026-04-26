import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService, CleaningProof, FridgeProof, Invoice, TraceabilityProof } from '../../core/api.service';

type HistoryType = 'ALL' | 'FRIDGE' | 'CLEANING' | 'TRACEABILITY';

interface HistoryItem {
  type: HistoryType;
  label: string;
  title: string;
  date?: string;
  createdBy?: string;
  comment?: string;
  photosCount: number;
}

@Component({
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <section class="page-head">
      <div>
        <h1>Historique des preuves</h1>
        <p>Toutes les preuves HACCP classées par date, type et utilisateur.</p>
      </div>
    </section>

    <div class="history-toolbar">
      <input type="date" [(ngModel)]="selectedDate">

      <button class="chip" [class.active]="type === 'ALL'" (click)="type='ALL'">Tout</button>
      <button class="chip" [class.active]="type === 'FRIDGE'" (click)="type='FRIDGE'">Frigo</button>
      <button class="chip" [class.active]="type === 'CLEANING'" (click)="type='CLEANING'">Nettoyage</button>
      <button class="chip" [class.active]="type === 'TRACEABILITY'" (click)="type='TRACEABILITY'">Traçabilité</button>
    </div>

    <div class="cards-grid">
      <div class="entity-card" *ngFor="let item of filteredHistory()">
        <div class="entity-head">
          <div>
            <strong>{{ item.title }}</strong>
            <p class="entity-subtitle">{{ item.label }}</p>
          </div>
          <span class="badge">{{ item.date || '-' }}</span>
        </div>

        <div class="trace-meta-grid">
          <div><span>Par</span><strong>{{ item.createdBy || '-' }}</strong></div>
          <div><span>Photos</span><strong>{{ item.photosCount }}</strong></div>
        </div>

        <p>{{ item.comment || '-' }}</p>
      </div>
    </div>
  `,
  styles: [`
    .page-head { margin-bottom: 18px; }
    .page-head h1 { margin: 0; font-size: 30px; color: #101828; }
    .page-head p { margin: 4px 0 0; color: #667085; }

    .history-toolbar {
      display: flex;
      gap: 8px;
      flex-wrap: wrap;
      margin-bottom: 16px;
      background: white;
      border: 1px solid #e4e7ec;
      border-radius: 18px;
      padding: 12px;
    }

    .history-toolbar input {
      border: 1px solid #d0d5dd;
      border-radius: 12px;
      padding: 9px 12px;
    }

    .chip {
      border: none;
      border-radius: 999px;
      padding: 9px 14px;
      background: #eef4fb;
      color: #0f4c81;
      font-weight: 900;
      cursor: pointer;
    }

    .chip.active {
      background: #0f4c81;
      color: white;
    }
  `]
})
export class HistoryComponent implements OnInit {
  private api = inject(ApiService);

  history: HistoryItem[] = [];
  type: HistoryType = 'ALL';
  selectedDate = '';

  ngOnInit(): void {
    this.loadFridges();
    this.loadCleaning();
    this.loadTraceability();
  }

  filteredHistory(): HistoryItem[] {
    return this.history.filter(item => {
      const matchType = this.type === 'ALL' || item.type === this.type;
      const matchDate = !this.selectedDate || (item.date || '').startsWith(this.selectedDate);
      return matchType && matchDate;
    });
  }

  private push(items: HistoryItem[]): void {
    this.history = [...this.history, ...items]
      .sort((a, b) => (b.date || '').localeCompare(a.date || ''));
  }

  private loadFridges(): void {
    this.api.getFridges().subscribe(fridges => {
      fridges.forEach(fridge => {
        if (!fridge.id) return;
        this.api.getFridgeProofs(fridge.id).subscribe((proofs: FridgeProof[]) => {
          this.push(proofs.map(p => ({
            type: 'FRIDGE',
            label: 'Preuve frigo',
            title: fridge.name,
            date: p.createdAt,
            createdBy: p.createdBy,
            comment: p.comment,
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
            type: 'CLEANING',
            label: 'Preuve nettoyage',
            title: zone.name,
            date: p.createdAt,
            createdBy: p.createdBy,
            comment: p.comment,
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
            type: 'TRACEABILITY',
            label: 'Preuve traçabilité',
            title: invoice.supplierName,
            date: p.createdAt,
            createdBy: p.createdBy,
            comment: p.comment,
            photosCount: p.photos?.length || 0
          })));
        });
      });
    });
  }
}