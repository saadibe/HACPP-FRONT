import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { ApiService, Invoice, InvoiceOcrResponse, InvoiceStats } from '../../core/api.service';
import { FilePickerComponent } from '../../shared/file-picker.component';

@Component({
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FilePickerComponent],
  template: `
    <section class="page-top">
      <div>
        <h1>Traçabilité</h1>
        <p>Recherche rapide, import document, OCR et consultation des pièces par période.</p>
      </div>
      <button type="button" class="btn-primary-pro action-lg" (click)="openModal()">Nouvelle pièce</button>
    </section>

    <div class="stats-grid" *ngIf="stats">
      <div class="stat-card clickable" (click)="applyToday()"><span>Aujourd'hui</span><strong>{{ stats.today }}</strong></div>
      <div class="stat-card clickable" (click)="applyMonth()"><span>Ce mois</span><strong>{{ stats.month }}</strong></div>
      <div class="stat-card clickable" (click)="applyYear()"><span>Cette année</span><strong>{{ stats.year }}</strong></div>
    </div>

    <div class="card">
      <div class="entity-toolbar no-margin">
        <div class="toolbar-pill">📂 Filtres d'archives</div>
        <div class="toolbar-help">Sélectionne une période puis filtre les pièces de traçabilité.</div>
      </div>

      <div class="form-grid">
        <input type="date" [formControl]="filterForm.controls.day">
        <input type="month" [formControl]="filterForm.controls.month">
        <input type="number" placeholder="Année" [formControl]="filterForm.controls.year">
      </div>
      <div class="row top-actions">
        <button type="button" class="btn-secondary-pro" (click)="search()">Filtrer</button>
        <button type="button" class="btn-secondary-pro" (click)="reset()">Réinitialiser</button>
      </div>
    </div>

    <div class="cards-grid">
      <div class="entity-card trace-card" *ngFor="let invoice of invoices">
        <div class="entity-head">
          <div>
            <strong>{{ invoice.supplierName }}</strong>
            <p class="entity-subtitle">{{ invoice.productCategory || 'Sans catégorie' }}</p>
          </div>
          <span class="badge">{{ invoice.traceabilityStatus || 'MANUAL_REVIEW' }}</span>
        </div>

        <div class="trace-meta-grid">
          <div><span>N°</span><strong>{{ invoice.invoiceNumber || '-' }}</strong></div>
          <div><span>Date</span><strong>{{ invoice.invoiceDate || '-' }}</strong></div>
          <div><span>Lot</span><strong>{{ invoice.supplierLot || '-' }}</strong></div>
          <div><span>DLC</span><strong>{{ invoice.dlcDate || '-' }}</strong></div>
        </div>

        <div class="action-grid">
          <a class="action-btn primary link-btn" *ngIf="invoice.filePath" [href]="api.publicUrl(invoice.filePath)" target="_blank">📄 Ouvrir le fichier</a>
        </div>
      </div>
    </div>

    <div class="modal-backdrop" *ngIf="showModal">
      <div class="modal-card modal-xlarge">
        <div class="modal-head">
          <h3>Nouvelle pièce de traçabilité</h3>
          <button class="icon-btn" type="button" (click)="closeModal()">×</button>
        </div>

        <div class="ocr-banner" *ngIf="ocrLoading">Lecture OCR en cours...</div>
        <div class="ocr-banner success" *ngIf="ocrDone">Préremplissage OCR terminé</div>
        <div class="ocr-banner" *ngIf="confidenceLabel">{{ confidenceLabel }} - score {{ confidence }}/100</div>

        <form [formGroup]="form" (ngSubmit)="submit()">
          <div class="form-grid">
            <input formControlName="supplierName" placeholder="Fournisseur">
            <input formControlName="invoiceNumber" placeholder="Numéro">
            <input type="date" formControlName="invoiceDate">
            <input formControlName="productCategory" placeholder="Catégorie produit">
            <input formControlName="batchNumber" placeholder="Batch fabrication">
            <input formControlName="supplierLot" placeholder="Lot fournisseur">
            <input type="date" formControlName="dlcDate">
            <input formControlName="deliveryReference" placeholder="Référence livraison">
            <input formControlName="storageLocation" placeholder="Emplacement stockage">
            <select formControlName="traceabilityStatus">
              <option value="MANUAL_REVIEW">À vérifier</option>
              <option value="OCR_DETECTED">OCR détecté</option>
              <option value="VALIDATED">Validé</option>
            </select>
            <textarea formControlName="note" placeholder="Note"></textarea>
          </div>

          <div class="camera-section">
            <app-file-picker
              accept="image/*,.pdf"
              cameraAccept="image/*"
              cameraLabel="Prendre photo du document"
              fileLabel="Importer image ou PDF"
              (fileSelected)="onTraceFilePicked($event)">
            </app-file-picker>
          </div>

          <div class="ocr-preview" *ngIf="ocrText">
            <strong>Texte OCR détecté</strong>
            <pre>{{ ocrText }}</pre>
          </div>

          <div class="modal-actions">
            <button type="button" class="btn-secondary-pro" (click)="closeModal()">Annuler</button>
            <button type="submit" class="btn-primary-pro action-lg">Enregistrer</button>
          </div>
        </form>
      </div>
    </div>
  `
})
export class TraceabilityComponent implements OnInit {
  private apiService = inject(ApiService);
  api = this.apiService;
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);

  invoices: Invoice[] = [];
  stats?: InvoiceStats;
  file?: File;
  showModal = false;
  ocrLoading = false;
  ocrDone = false;
  ocrText = '';
  confidence = 0;
  confidenceLabel = '';

  filterForm = this.fb.nonNullable.group({
    day: '',
    month: '',
    year: 0
  });

  form = this.fb.nonNullable.group({
    supplierName: '',
    invoiceNumber: '',
    invoiceDate: '',
    productCategory: '',
    batchNumber: '',
    supplierLot: '',
    dlcDate: '',
    deliveryReference: '',
    storageLocation: 'Réserve',
    traceabilityStatus: 'MANUAL_REVIEW',
    note: ''
  });

  ngOnInit(): void {
    this.api.getInvoiceStats().subscribe(s => this.stats = s);
    this.route.queryParamMap.subscribe(params => {
      const scope = params.get('scope');
      if (scope === 'today') this.applyToday();
      else if (scope === 'month') this.applyMonth();
      else if (scope === 'year') this.applyYear();
      else this.search();
    });
  }

  search(): void {
    const v = this.filterForm.getRawValue();
    const filters: any = {};
    if (v.day) filters.day = v.day;
    else if (v.month) filters.month = v.month;
    else if (v.year && v.year > 0) filters.year = v.year;
    this.api.getInvoices(filters).subscribe(data => this.invoices = data);
  }

  reset(): void {
    this.filterForm.reset({ day: '', month: '', year: 0 });
    this.search();
  }

  applyToday(): void {
    const today = new Date().toISOString().slice(0, 10);
    this.filterForm.patchValue({ day: today, month: '', year: 0 });
    this.search();
  }

  applyMonth(): void {
    const today = new Date().toISOString().slice(0, 7);
    this.filterForm.patchValue({ day: '', month: today, year: 0 });
    this.search();
  }

  applyYear(): void {
    const year = new Date().getFullYear();
    this.filterForm.patchValue({ day: '', month: '', year });
    this.search();
  }

  openModal(): void {
    this.showModal = true;
    this.ocrLoading = false;
    this.ocrDone = false;
    this.ocrText = '';
    this.confidence = 0;
    this.confidenceLabel = '';
  }

  closeModal(): void {
    this.showModal = false;
    this.file = undefined;
    this.ocrLoading = false;
    this.ocrDone = false;
    this.ocrText = '';
    this.confidence = 0;
    this.confidenceLabel = '';
    this.form.reset({
      supplierName: '', invoiceNumber: '', invoiceDate: '', productCategory: '', batchNumber: '',
      supplierLot: '', dlcDate: '', deliveryReference: '', storageLocation: 'Réserve',
      traceabilityStatus: 'MANUAL_REVIEW', note: ''
    });
  }

  onTraceFilePicked(selected: File): void {
    this.file = selected;
    const fd = new FormData();
    fd.append('file', selected);
    this.ocrLoading = true;
    this.ocrDone = false;
    this.api.ocrInvoice(fd).subscribe({
      next: (ocr: InvoiceOcrResponse) => {
        this.ocrLoading = false;
        this.ocrDone = true;
        this.ocrText = ocr.rawText || '';
        this.confidence = ocr.confidence || 0;
        this.confidenceLabel = ocr.confidenceLabel || '';
        this.form.patchValue({
          supplierName: ocr.supplierName || '',
          invoiceNumber: ocr.invoiceNumber || '',
          invoiceDate: ocr.invoiceDate || '',
          productCategory: ocr.productCategory || '',
          batchNumber: ocr.batchNumber || '',
          supplierLot: ocr.supplierLot || '',
          dlcDate: ocr.dlcDate || '',
          deliveryReference: ocr.deliveryReference || '',
          storageLocation: ocr.storageLocation || 'Réserve',
          traceabilityStatus: ocr.traceabilityStatus || 'OCR_DETECTED',
          note: ocr.note || ''
        });
      },
      error: () => { this.ocrLoading = false; }
    });
  }

  submit(): void {
    if (!this.file) return;
    const value = this.form.getRawValue();
    const fd = new FormData();
    fd.append('supplierName', value.supplierName);
    if (value.invoiceNumber) fd.append('invoiceNumber', value.invoiceNumber);
    if (value.invoiceDate) fd.append('invoiceDate', value.invoiceDate);
    if (value.productCategory) fd.append('productCategory', value.productCategory);
    if (value.batchNumber) fd.append('batchNumber', value.batchNumber);
    if (value.supplierLot) fd.append('supplierLot', value.supplierLot);
    if (value.dlcDate) fd.append('dlcDate', value.dlcDate);
    if (value.deliveryReference) fd.append('deliveryReference', value.deliveryReference);
    if (value.storageLocation) fd.append('storageLocation', value.storageLocation);
    if (value.traceabilityStatus) fd.append('traceabilityStatus', value.traceabilityStatus);
    if (value.note) fd.append('note', value.note);
    if (this.ocrText) fd.append('ocrRawText', this.ocrText);
    fd.append('file', this.file);

    this.api.createInvoice(fd).subscribe(() => {
      this.closeModal();
      this.api.getInvoiceStats().subscribe(s => this.stats = s);
      this.search();
    });
  }
}
