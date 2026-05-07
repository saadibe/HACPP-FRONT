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
      <div class="history-header">
        <div>
          <h1>Historique des preuves</h1>
          <p>Consultez les contrôles HACCP par date, type et utilisateur.</p>
        </div>
      </div>

      <div class="history-filters">
        <input type="date" [(ngModel)]="selectedDate">

<select class="filter-select" [(ngModel)]="type">
  <option value="ALL">Tout</option>
  <option value="FRIDGE">Frigo</option>
  <option value="CLEANING">Nettoyage</option>
  <option value="TRACEABILITY">Traçabilité</option>
</select>
      </div>

      <div class="history-card">
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Type</th>
              <th>Élément</th>
              <th>Par</th>
              <th>Commentaire</th>
              <th>Photos</th>
              <th>Preuve</th>
            </tr>
          </thead>

          <tbody>
            <tr *ngFor="let item of filteredHistory()">
              <td>{{ item.date || '-' }}</td>
              <td><span class="type-badge">{{ item.label }}</span></td>
              <td><strong>{{ item.title }}</strong></td>
              <td>{{ item.createdBy || '-' }}</td>
              <td>{{ item.comment || '-' }}</td>
              <td>{{ item.photosCount }}</td>
              <td>
                <button
                  class="eye-btn"
                  type="button"
                  *ngIf="item.photos.length > 0"
                  (click)="openProofImage(item.photos[0])"
                >
                  👁️ Voir
                </button>
                <span class="empty-proof" *ngIf="item.photos.length === 0">-</span>
              </td>
            </tr>

            <tr *ngIf="filteredHistory().length === 0">
              <td colspan="7" class="empty">Aucune preuve trouvée.</td>
            </tr>
          </tbody>
        </table>
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
      display: grid;
      gap: 18px;
    }

    .history-header h1 {
      margin: 0;
      font-size: 30px;
      font-weight: 900;
      color: #08264a;
    }

    .history-header p {
      margin: 6px 0 0;
      color: #667085;
      font-weight: 600;
    }

    .history-filters {
      background: white;
      border: 1px solid #dfe7f2;
      border-radius: 18px;
      padding: 14px;
      display: flex;
      gap: 14px;
      align-items: center;
      box-shadow: 0 10px 25px rgba(15, 23, 42, .06);
    }

    .history-filters input {
      height: 42px;
      border: 1px solid #d0d5dd;
      border-radius: 12px;
      padding: 0 12px;
      min-width: 180px;
      font-weight: 700;
    }

.filter-select {
  height: 44px;
  min-width: 220px;
  border-radius: 14px;
  border: 1px solid #d0d5dd;
  background: white;
  padding: 0 14px;
  font-weight: 800;
  color: #0f172a;
  outline: none;
  cursor: pointer;
  box-shadow: 0 1px 2px rgba(16, 24, 40, .04);
}

.filter-select:focus {
  border-color: #0f4c81;
  box-shadow: 0 0 0 4px rgba(15, 76, 129, .12);
}

    .history-card {
      background: white;
      border: 1px solid #dfe7f2;
      border-radius: 20px;
      overflow: hidden;
      box-shadow: 0 14px 35px rgba(15, 23, 42, .08);
    }

    table {
      width: 100%;
      border-collapse: collapse;
    }

    th {
      background: #f8fafc;
      color: #52637a;
      font-size: 12px;
      text-transform: uppercase;
      letter-spacing: .06em;
      padding: 14px;
      text-align: left;
    }

    td {
      padding: 14px;
      border-top: 1px solid #eef2f7;
      color: #101828;
      font-weight: 650;
      vertical-align: middle;
    }

    .type-badge {
      display: inline-flex;
      padding: 6px 10px;
      border-radius: 999px;
      background: #e8f2ff;
      color: #0f4c81;
      font-size: 12px;
      font-weight: 900;
    }

.eye-btn {
  border: none;
  background: #0f4c81;
  color: white;
  height: 32px;
  min-width: 78px;
  padding: 0 12px;
  border-radius: 10px;
  cursor: pointer;
  font-weight: 800;
  font-size: 13px;

  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;

  transition: .18s ease;
}

.eye-btn:hover {
  background: #0b3d67;
  transform: translateY(-1px);
}

    .empty-proof,
    .empty {
      color: #98a2b3;
      font-weight: 800;
    }

    .empty {
      text-align: center;
      padding: 30px;
    }

    .image-modal {
      position: fixed;
      inset: 0;
      background: rgba(15, 23, 42, .70);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 9999;
      padding: 20px;
    }

    .image-box {
      background: white;
      border-radius: 22px;
      padding: 16px;
      max-width: 92vw;
      max-height: 92vh;
      position: relative;
    }

    .image-box img {
      max-width: 86vw;
      max-height: 82vh;
      border-radius: 14px;
      display: block;
    }

    .close-btn {
      position: absolute;
      top: -14px;
      right: -14px;
      width: 36px;
      height: 36px;
      border-radius: 50%;
      border: none;
      background: #0f172a;
      color: white;
      font-size: 22px;
      cursor: pointer;
    }

    @media (max-width: 900px) {
      .history-filters {
        display: grid;
      }

      .history-card {
        overflow-x: auto;
      }

      table {
        min-width: 900px;
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