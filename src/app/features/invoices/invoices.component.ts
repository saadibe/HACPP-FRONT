import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { ApiService, Invoice, InvoiceOcrResponse } from '../../core/api.service';

@Component({
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <section class="page-top">
      <div>
        <h1>Factures traçabilité</h1>
        <p>Import avec OCR et champs de traçabilité.</p>
      </div>
      <button type="button" class="btn-primary-pro" (click)="openModal()">Importer une facture</button>
    </section>

    <div class="cards-grid">
      <div class="entity-card" *ngFor="let invoice of invoices">
        <div class="entity-head">
          <strong>{{ invoice.supplierName }}</strong>
          <span class="badge">{{ invoice.traceabilityStatus || 'MANUAL_REVIEW' }}</span>
        </div>
        <p><strong>N° :</strong> {{ invoice.invoiceNumber || '-' }}</p>
        <p><strong>Date :</strong> {{ invoice.invoiceDate || '-' }}</p>
        <p><strong>Catégorie :</strong> {{ invoice.productCategory || '-' }}</p>
        <p><strong>Lot :</strong> {{ invoice.supplierLot || '-' }}</p>
        <p><strong>Batch :</strong> {{ invoice.batchNumber || '-' }}</p>
        <p><strong>DLC :</strong> {{ invoice.dlcDate || '-' }}</p>
        <p><strong>Réf livraison :</strong> {{ invoice.deliveryReference || '-' }}</p>
        <p><strong>Stockage :</strong> {{ invoice.storageLocation || '-' }}</p>
        <a *ngIf="invoice.filePath" [href]="api.publicUrl(invoice.filePath)" target="_blank">Ouvrir le fichier</a>
      </div>
    </div>

    <div class="modal-backdrop" *ngIf="showModal">
      <div class="modal-card modal-xlarge">
        <div class="modal-head">
          <h3>Importer une facture de traçabilité</h3>
          <button class="icon-btn" type="button" (click)="closeModal()">×</button>
        </div>

        <div class="ocr-banner" *ngIf="ocrLoading">Lecture OCR en cours...</div>
        <div class="ocr-banner success" *ngIf="ocrDone">Préremplissage OCR terminé</div>

        <form [formGroup]="form" (ngSubmit)="submit()">
          <div class="form-grid">
            <input formControlName="supplierName" placeholder="Fournisseur">
            <input formControlName="invoiceNumber" placeholder="Numéro facture">
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
            <input type="file" (change)="onFile($event)" accept="image/*,.pdf">
          </div>

          <div class="ocr-preview" *ngIf="ocrText">
            <strong>Texte OCR détecté</strong>
            <pre>{{ ocrText }}</pre>
          </div>

          <div class="modal-actions">
            <button type="button" class="btn-secondary-pro" (click)="closeModal()">Annuler</button>
            <button type="submit" class="btn-primary-pro">Enregistrer la traçabilité</button>
          </div>
        </form>
      </div>
    </div>
  `
})
export class InvoicesComponent implements OnInit {
  readonly api = inject(ApiService);
  private fb = inject(FormBuilder);
  invoices: Invoice[] = [];
  file?: File;
  showModal = false;
  ocrLoading = false;
  ocrDone = false;
  ocrText = '';

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

  ngOnInit(): void { this.load(); }

  load(): void {
    this.api.getInvoices().subscribe(data => this.invoices = data);
  }

  openModal(): void {
    this.showModal = true;
    this.ocrLoading = false;
    this.ocrDone = false;
    this.ocrText = '';
  }

  closeModal(): void {
    this.showModal = false;
    this.file = undefined;
    this.ocrLoading = false;
    this.ocrDone = false;
    this.ocrText = '';
    this.form.reset({
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
  }

  onFile(event: Event): void {
    const input = event.target as HTMLInputElement;
    const selected = input.files?.[0];
    if (!selected) return;
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
      this.load();
    });
  }
}
