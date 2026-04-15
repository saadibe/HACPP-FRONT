import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { ApiService, Batch } from '../../core/api.service';

@Component({
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="print-page" *ngIf="batch">
      <div class="print-label">
        <div class="print-header">
          <h2>Étiquette DLC</h2>
          <span>La Perla HACCP</span>
        </div>

        <div class="print-content">
          <div class="line"><strong>Produit :</strong> {{ batch.productName }}</div>
          <div class="line"><strong>Catégorie :</strong> {{ batch.category || '-' }}</div>
          <div class="line"><strong>Préparé le :</strong> {{ batch.preparedAt }}</div>
          <div class="line"><strong>DLC :</strong> {{ batch.dlcAt }}</div>
          <div class="line"><strong>Conservation :</strong> {{ batch.storageTemp || '-' }}</div>
          <div class="line"><strong>Préparé par :</strong> {{ batch.createdBy }}</div>
        </div>

        <div class="print-qr">
          <img *ngIf="batch.qrCodePath" [src]="api.publicUrl(batch.qrCodePath)" alt="QR">
        </div>
      </div>

      <div class="row no-print">
        <button (click)="print()">Imprimer</button>
        <button class="secondary" onclick="history.back()">Retour</button>
      </div>
    </div>
  `,
  styles: [`
    .print-page { padding: 24px; background: white; min-height: 100vh; }
    .print-label { max-width: 420px; border: 2px solid #111827; padding: 20px; border-radius: 12px; }
    .print-header { display:flex; justify-content:space-between; align-items:center; margin-bottom: 16px; }
    .print-header h2 { margin:0; font-size: 24px; }
    .print-content .line { margin-bottom: 10px; font-size: 16px; }
    .print-qr img { width: 140px; height: 140px; object-fit: contain; margin-top: 12px; }
    @media print {
      .no-print { display: none !important; }
      body { background: white !important; }
      .print-page { padding: 0; }
    }
  `]
})
export class PrintBatchComponent implements OnInit {
  readonly api = inject(ApiService);
  private route = inject(ActivatedRoute);
  batch?: Batch;

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.api.getBatch(id).subscribe(data => this.batch = data);
  }

  print(): void {
    window.print();
  }
}
