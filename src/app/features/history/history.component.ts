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
  photos: string[];
}

@Component({
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <section class="history-page">

      <div class="history-title">
        <h1>Historique</h1>
        <p>Retrouvez toutes les preuves HACCP enregistrées.</p>
      </div>

      <div class="search-box">
        <input type="date" [(ngModel)]="selectedDate">

        <select [(ngModel)]="type">
          <option value="ALL">Toutes les preuves</option>
          <option value="FRIDGE">Frigo</option>
          <option value="CLEANING">Nettoyage</option>
          <option value="TRACEABILITY">Traçabilité</option>
        </select>
      </div>

      <div class="history-list">
        <div class="history-item" *ngFor="let item of filteredHistory()">

          <div class="history-top">
            <div>
              <h3>{{ item.title }}</h3>
              <p>{{ item.label }}</p>
            </div>

            <span class="date-pill">
              {{ formatDate(item.date) }}
            </span>
          </div>

          <div class="meta-grid">
            <div class="meta-card">
              <span>Par</span>
              <strong>{{ item.createdBy || '-' }}</strong>
            </div>

            <div class="meta-card">
              <span>Photos</span>
              <strong>{{ item.photosCount }}</strong>
            </div>

            <button
              class="view-btn"
              type="button"
              *ngIf="item.photos.length > 0"
              (click)="openProofImage(item.photos[0])"
            >
              👁 Voir
            </button>

            <div class="meta-card no-photo" *ngIf="item.photos.length === 0">
              <span>Preuve</span>
              <strong>-</strong>
            </div>
          </div>

          <div class="comment">
            {{ item.comment || '-' }}
          </div>

        </div>

        <div class="empty-state" *ngIf="filteredHistory().length === 0">
          Aucune preuve trouvée.
        </div>
      </div>

      <div class="image-modal" *ngIf="selectedImage" (click)="closeProofImage()">
        <div class="image-box" (click)="$event.stopPropagation()">
          <button class="close-btn" type="button" (click)="closeProofImage()">×</button>
          <img [src]="selectedImage" alt="Preuve HACCP">
        </div>
      </div>

    </section>
  `,
  styles: [`
    .history-page {
      padding: 16px;
      background: #f3f6fa;
      min-height: 100vh;
      display: grid;
      gap: 16px;
    }

    .history-title h1 {
      margin: 0;
      font-size: 32px;
      font-weight: 950;
      color: #0f172a;
      letter-spacing: -0.5px;
    }

    .history-title p {
      margin: 6px 0 0;
      color: #64748b;
      font-weight: 700;
    }

    .search-box {
      display: grid;
      grid-template-columns: 1fr 240px;
      gap: 12px;
      background: white;
      border: 1px solid #dbe5ef;
      border-radius: 24px;
      padding: 14px;
      box-shadow: 0 10px 26px rgba(15, 23, 42, .06);
    }

    .search-box input,
    .search-box select {
      height: 52px;
      border-radius: 18px;
      border: 1px solid #d0d7e2;
      background: white;
      padding: 0 16px;
      font-size: 15px;
      font-weight: 800;
      color: #0f172a;
      outline: none;
    }

    .search-box input:focus,
    .search-box select:focus {
      border-color: #0f4c81;
      box-shadow: 0 0 0 4px rgba(15, 76, 129, .12);
    }

    .history-list {
      display: grid;
      gap: 14px;
    }

    .history-item {
      background: white;
      border-radius: 24px;
      padding: 18px;
      border: 1px solid #e2e8f0;
      box-shadow: 0 10px 28px rgba(15, 23, 42, .07);
      overflow: hidden;
    }

    .history-top {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      gap: 12px;
      margin-bottom: 14px;
    }

    .history-top h3 {
      margin: 0;
      font-size: 21px;
      color: #0f172a;
      font-weight: 950;
    }

    .history-top p {
      margin: 4px 0 0;
      color: #667085;
      font-weight: 800;
      line-height: 1.25;
    }

    .date-pill {
      background: #e8f2ff;
      color: #0f4c81;
      border: 1px solid #cfe2fb;
      border-radius: 999px;
      padding: 8px 12px;
      font-size: 12px;
      font-weight: 950;
      white-space: nowrap;
    }

    .meta-grid {
      display: grid;
      grid-template-columns: 1fr 1fr 110px;
      gap: 10px;
      margin-bottom: 14px;
    }

    .meta-card {
      background: #f8fafc;
      border-radius: 16px;
      padding: 12px;
      border: 1px solid #e2e8f0;
      min-height: 58px;
    }

    .meta-card span {
      display: block;
      font-size: 12px;
      color: #64748b;
      margin-bottom: 5px;
      font-weight: 900;
    }

    .meta-card strong {
      font-size: 17px;
      color: #0f172a;
      font-weight: 950;
    }

    .view-btn {
      border: none;
      border-radius: 16px;
      background: linear-gradient(135deg, #0f4c81, #0a3760);
      color: white;
      font-weight: 950;
      font-size: 15px;
      cursor: pointer;
      box-shadow: 0 10px 22px rgba(15, 76, 129, .20);
    }

    .comment {
      color: #344054;
      font-weight: 650;
      line-height: 1.5;
      background: #fbfdff;
      border-radius: 16px;
      padding: 12px;
      border: 1px solid #edf2f7;
    }

    .empty-state {
      background: white;
      border-radius: 22px;
      padding: 28px;
      text-align: center;
      color: #94a3b8;
      font-weight: 900;
      border: 1px solid #e2e8f0;
    }

    .image-modal {
      position: fixed;
      inset: 0;
      background: rgba(15, 23, 42, .72);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 9999;
      padding: 20px;
    }

    .image-box {
      background: white;
      border-radius: 24px;
      padding: 16px;
      max-width: 92vw;
      max-height: 92vh;
      position: relative;
      box-shadow: 0 30px 80px rgba(0,0,0,.35);
    }

    .image-box img {
      max-width: 86vw;
      max-height: 82vh;
      border-radius: 16px;
      display: block;
    }

    .close-btn {
      position: absolute;
      top: -14px;
      right: -14px;
      width: 38px;
      height: 38px;
      border-radius: 50%;
      border: none;
      background: #0f172a;
      color: white;
      font-size: 24px;
      cursor: pointer;
      box-shadow: 0 10px 20px rgba(0,0,0,.25);
    }

    @media (max-width: 700px) {
      .history-page {
        padding: 12px;
      }

      .search-box {
        grid-template-columns: 1fr;
        border-radius: 22px;
      }

      .history-title h1 {
        font-size: 28px;
      }

      .history-top {
        flex-direction: column;
      }

      .meta-grid {
        grid-template-columns: 1fr 1fr 92px;
      }

      .view-btn {
        font-size: 13px;
      }
    }
  `]
})
export class HistoryComponent implements OnInit {
  private api = inject(ApiService);

  history: HistoryItem[] = [];
  type: HistoryType = 'ALL';
  selectedDate = '';
  selectedImage = '';

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

  openProofImage(url: string): void {
    this.selectedImage = url;
  }

  closeProofImage(): void {
    this.selectedImage = '';
  }

  formatDate(value?: string): string {
    if (!value) return '-';
    return value.replace('T', ' ').substring(0, 16);
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
            photosCount: p.photos?.length || 0,
            photos: (p.photos || []).map(photo => photo.url)
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
            photosCount: p.photos?.length || 0,
            photos: (p.photos || []).map(photo => photo.url)
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
            photosCount: p.photos?.length || 0,
            photos: (p.photos || []).map(photo => photo.url)
          })));
        });
      });
    });
  }
}