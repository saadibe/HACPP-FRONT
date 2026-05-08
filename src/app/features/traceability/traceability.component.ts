import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import {
  ApiService,
  Invoice,
  InvoiceOcrResponse,
  InvoiceStats,
  TraceabilityProof,
  ProofPhoto
} from '../../core/api.service';

@Component({
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <section class="page-top">
      <div>
        <h1>Traçabilité</h1>
        <p>Gestion améliorée des preuves : plusieurs photos dans une même preuve, affichage compact et plus propre.</p>
      </div>
      <button type="button" class="btn-primary-pro action-lg" (click)="openCreateModal()">Nouvelle pièce</button>
    </section>

    <div class="stats-grid" *ngIf="stats">
      <div class="stat-card clickable" (click)="applyToday()"><span>Aujourd'hui</span><strong>{{ stats.today }}</strong></div>
      <div class="stat-card clickable" (click)="applyMonth()"><span>Ce mois</span><strong>{{ stats.month }}</strong></div>
      <div class="stat-card clickable" (click)="applyYear()"><span>Cette année</span><strong>{{ stats.year }}</strong></div>
    </div>

    <div class="card">
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
          <a class="action-btn primary link-btn" *ngIf="invoice.filePath" [href]="api.publicUrl(invoice.filePath)" target="_blank">📄 Ouvrir</a>
          <button type="button" class="action-btn" (click)="openEditModal(invoice)">✏️ Modifier</button>
          <button type="button" class="action-btn" (click)="toggleProofs(invoice)">📚 Preuves</button>
          <button type="button" class="action-btn primary" (click)="openProofModal(invoice)">📷 Nouvelle preuve</button>
          <button type="button" class="action-btn subtle" (click)="remove(invoice.id!)">🗑️ Supprimer</button>
        </div>

        <div class="proof-list" *ngIf="selectedInvoiceId === invoice.id">
          <div class="proof-card" *ngFor="let proof of (invoiceProofs[invoice.id!] || [])">
            <div class="proof-header">
              <div><strong>{{ proof.createdBy }}</strong></div>
              <div>{{ proof.createdAt }}</div>
            </div>

            <p>{{ proof.comment || '-' }}</p>

            <div class="photo-grid">
              <div *ngFor="let photo of proof.photos">
                <img class="photo-thumb" [src]="api.publicUrl(photo.url)" alt="">
                <div class="photo-actions">
                  <button type="button" class="icon-btn-small tiny-danger" (click)="deleteTraceabilityPhoto(proof, photo)">🗑️</button>
                </div>
              </div>
            </div>

            <div class="action-grid">
              <button type="button" class="action-btn subtle" (click)="deleteTraceabilityProof(invoice.id!, proof.id!)">🗑️ Supprimer la preuve</button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="modal-backdrop" *ngIf="showModal">
      <div class="modal-card modal-xlarge">
        <div class="modal-head">
          <h3>{{ editingId ? 'Modifier la pièce' : 'Nouvelle pièce de traçabilité' }}</h3>
          <button class="icon-btn" type="button" (click)="closeModal()">×</button>
        </div>

        <div class="ocr-banner" *ngIf="ocrLoading">Lecture IA en cours...</div>
        <div class="ocr-banner success" *ngIf="ocrDone">Préremplissage IA terminé</div>
        <div class="ocr-banner" *ngIf="confidenceLabel">{{ confidenceLabel }} - score {{ confidence }}/100</div>

        <form [formGroup]="form" (ngSubmit)="submit()">
          <div class="form-grid">
            <input formControlName="supplierName" placeholder="Fournisseur">
            <input formControlName="invoiceNumber" placeholder="Numéro">
            <input type="date" formControlName="invoiceDate">
            <input formControlName="supplierLot" placeholder="Lot fournisseur">
            <input type="date" formControlName="dlcDate">
            <textarea formControlName="note" placeholder="Note"></textarea>
          </div>

          <div class="camera-section" *ngIf="!editingId">
            <label class="picker-btn">
              📄 Choisir image ou PDF
              <input type="file" accept="image/*,.pdf" (change)="onTraceFilePicked($event)" hidden>
            </label>
            <div class="file-name" *ngIf="file">{{ file.name }}</div>
          </div>

          <div class="ocr-preview" *ngIf="ocrText">
            <strong>Texte OCR détecté</strong>
            <pre>{{ ocrText }}</pre>
          </div>

          <div class="modal-actions">
            <button type="button" class="btn-secondary-pro" (click)="closeModal()">Annuler</button>
            <button type="submit" class="btn-primary-pro action-lg">
              {{ editingId ? 'Enregistrer les modifications' : 'Enregistrer' }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <div class="modal-backdrop" *ngIf="showProofCreateModal && currentInvoice">
      <div class="modal-card">
        <div class="modal-head">
          <h3>Nouvelle preuve - {{ currentInvoice.supplierName }}</h3>
          <button class="icon-btn" type="button" (click)="closeProofModal()">×</button>
        </div>

        <form [formGroup]="proofCreateForm" (ngSubmit)="submitTraceabilityProof()">
          <div class="form-grid">
            <input formControlName="createdBy" placeholder="Réalisé par">
            <textarea formControlName="comment" placeholder="Commentaire"></textarea>
          </div>

          <div class="drop-zone" (dragover)="onDragOver($event)" (drop)="onProofFilesDropped($event)">
            <div class="drop-zone-actions">
              <label class="icon-action" title="Importer plusieurs fichiers">
                📎
                <input type="file" accept="image/*,.pdf" multiple (change)="onProofFilesPicked($event)" hidden>
              </label>

              <label class="icon-action" title="Prendre une photo">
                📷
                <input type="file" accept="image/*" capture="environment" (change)="onProofFilesPicked($event)" hidden>
              </label>

              <span class="file-counter">{{ proofFiles.length }} fichier(s)</span>
            </div>

            <div class="drop-hint">Glisse-dépose plusieurs fichiers ou ajoute des photos une par une dans la même preuve.</div>

            <div class="photo-grid" *ngIf="proofFiles.length">
              <div *ngFor="let file of proofFiles; let i = index" class="sortable-photo-card">
                <div class="file-name">{{ file.name }}</div>
                <div class="photo-actions">
                  <button type="button" class="icon-btn-small tiny-danger" (click)="removeSelectedProofFile(i)">🗑️</button>
                </div>
              </div>
            </div>
          </div>

          <div class="modal-actions">
            <button type="button" class="btn-secondary-pro" (click)="closeProofModal()">Annuler</button>
            <button type="submit" class="btn-primary-pro action-lg">Enregistrer la preuve</button>
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
  invoiceProofs: Record<number, TraceabilityProof[]> = {};
  selectedInvoiceId?: number;
  stats?: InvoiceStats;
  file?: File;
  proofFiles: File[] = [];
  currentInvoice?: Invoice;
  showModal = false;
  showProofCreateModal = false;
  ocrLoading = false;
  ocrDone = false;
  ocrText = '';
  confidence = 0;
  confidenceLabel = '';
  editingId?: number;

  filterForm = this.fb.nonNullable.group({
    day: '',
    month: '',
    year: 0
  });

  form = this.fb.nonNullable.group({
    supplierName: '',
    invoiceNumber: '',
    invoiceDate: this.today(),
    productCategory: '',
    batchNumber: '',
    supplierLot: '',
    dlcDate: '',
    deliveryReference: '',
    storageLocation: 'Réserve',
    traceabilityStatus: 'MANUAL_REVIEW',
    note: ''
  });

  proofCreateForm = this.fb.nonNullable.group({
    createdBy: '',
    comment: ''
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
    this.filterForm.patchValue({
      day: this.today(),
      month: '',
      year: 0
    });
    this.search();
  }

  applyMonth(): void {
    this.filterForm.patchValue({
      day: '',
      month: this.today().slice(0, 7),
      year: 0
    });
    this.search();
  }

  applyYear(): void {
    this.filterForm.patchValue({
      day: '',
      month: '',
      year: new Date().getFullYear()
    });
    this.search();
  }

  toggleProofs(invoice: Invoice): void {
    if (this.selectedInvoiceId === invoice.id) {
      this.selectedInvoiceId = undefined;
      return;
    }

    this.selectedInvoiceId = invoice.id;
    this.api.getTraceabilityProofs(invoice.id!).subscribe(v => {
      this.invoiceProofs[invoice.id!] = v;
    });
  }

  openProofModal(invoice: Invoice): void {
    this.currentInvoice = invoice;
    this.proofFiles = [];
    this.proofCreateForm.reset({
      createdBy: '',
      comment: ''
    });
    this.showProofCreateModal = true;
  }

  closeProofModal(): void {
    this.showProofCreateModal = false;
    this.currentInvoice = undefined;
    this.proofFiles = [];
  }

  onProofFilesPicked(event: Event): void {
    const input = event.target as HTMLInputElement;
    const files = Array.from(input.files || []);

    this.proofFiles = [...this.proofFiles, ...files];
    input.value = '';
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
  }

  onProofFilesDropped(event: DragEvent): void {
    event.preventDefault();

    const files = Array.from(event.dataTransfer?.files || []);
    this.proofFiles = [...this.proofFiles, ...files];
  }

  removeSelectedProofFile(index: number): void {
    this.proofFiles = this.proofFiles.filter((_, i) => i !== index);
  }

  submitTraceabilityProof(): void {
    if (!this.currentInvoice?.id || !this.proofFiles.length) return;

    const v = this.proofCreateForm.getRawValue();
    const fd = new FormData();

    fd.append('createdBy', v.createdBy);
    fd.append('comment', v.comment);

    this.proofFiles.forEach(f => fd.append('photos', f));

    this.api.createTraceabilityProof(this.currentInvoice.id, fd).subscribe(() => {
      const id = this.currentInvoice!.id!;

      this.closeProofModal();
      this.selectedInvoiceId = id;

      this.api.getTraceabilityProofs(id).subscribe(r => {
        this.invoiceProofs[id] = r;
      });
    });
  }

  deleteTraceabilityProof(invoiceId: number, proofId: number): void {
    this.api.deleteTraceabilityProof(proofId).subscribe(() => {
      this.api.getTraceabilityProofs(invoiceId).subscribe(r => {
        this.invoiceProofs[invoiceId] = r;
      });
    });
  }

  deleteTraceabilityPhoto(proof: TraceabilityProof, photo: ProofPhoto): void {
    this.api.deleteTraceabilityPhoto(photo.id!).subscribe(() => {
      proof.photos = (proof.photos || []).filter(p => p.id !== photo.id);
    });
  }

  openCreateModal(): void {
    this.editingId = undefined;
    this.showModal = true;
    this.resetModalState();
  }

  openEditModal(invoice: Invoice): void {
    this.editingId = invoice.id;
    this.showModal = true;
    this.file = undefined;
    this.ocrLoading = false;
    this.ocrDone = false;
    this.ocrText = invoice.ocrRawText || '';
    this.confidence = 0;
    this.confidenceLabel = '';

    this.form.patchValue({
      supplierName: invoice.supplierName || '',
      invoiceNumber: invoice.invoiceNumber || '',
      invoiceDate: invoice.invoiceDate || this.today(),
      productCategory: invoice.productCategory || '',
      batchNumber: invoice.batchNumber || '',
      supplierLot: invoice.supplierLot || '',
      dlcDate: invoice.dlcDate || '',
      deliveryReference: invoice.deliveryReference || '',
      storageLocation: invoice.storageLocation || 'Réserve',
      traceabilityStatus: invoice.traceabilityStatus || 'MANUAL_REVIEW',
      note: invoice.note || ''
    });
  }

  closeModal(): void {
    this.showModal = false;
    this.editingId = undefined;
    this.resetModalState();
  }

  resetModalState(): void {
    this.file = undefined;
    this.ocrLoading = false;
    this.ocrDone = false;
    this.ocrText = '';
    this.confidence = 0;
    this.confidenceLabel = '';

    this.form.reset({
      supplierName: '',
      invoiceNumber: '',
      invoiceDate: this.today(),
      productCategory: '',
      batchNumber: '',
      supplierLot: '',
      dlcDate: '',
      deliveryReference: '',
      storageLocation: 'Réserve',
      traceabilityStatus: 'MANUAL_REVIEW',
      note: ''
    });

    setTimeout(() => {
      this.form.controls.invoiceDate.setValue(this.today());
    });
  }

  onTraceFilePicked(event: Event): void {
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
        this.confidence = ocr.confidence || 0;
        this.confidenceLabel = ocr.confidenceLabel || '';

        this.form.patchValue({
          supplierName: ocr.supplierName || '',
          invoiceNumber: ocr.invoiceNumber || '',
          invoiceDate: ocr.invoiceDate || this.today(),
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
      error: () => {
        this.ocrLoading = false;
      }
    });
  }

  submit(): void {
    const value = this.form.getRawValue();
    const fd = new FormData();

    fd.append('supplierName', value.supplierName);
    fd.append('invoiceDate', value.invoiceDate || this.today());

    if (value.invoiceNumber) fd.append('invoiceNumber', value.invoiceNumber);
    if (value.productCategory) fd.append('productCategory', value.productCategory);
    if (value.batchNumber) fd.append('batchNumber', value.batchNumber);
    if (value.supplierLot) fd.append('supplierLot', value.supplierLot);
    if (value.dlcDate) fd.append('dlcDate', value.dlcDate);
    if (value.deliveryReference) fd.append('deliveryReference', value.deliveryReference);
    if (value.storageLocation) fd.append('storageLocation', value.storageLocation);
    if (value.traceabilityStatus) fd.append('traceabilityStatus', value.traceabilityStatus);
    if (value.note) fd.append('note', value.note);
    if (this.ocrText) fd.append('ocrRawText', this.ocrText);

    if (this.editingId) {
      this.api.updateInvoice(this.editingId, fd).subscribe(() => {
        this.closeModal();
        this.api.getInvoiceStats().subscribe(s => this.stats = s);
        this.search();
      });
      return;
    }

    if (!this.file) return;

    fd.append('file', this.file);

    this.api.createInvoice(fd).subscribe(() => {
      this.closeModal();
      this.api.getInvoiceStats().subscribe(s => this.stats = s);
      this.search();
    });
  }

  remove(id: number): void {
    this.api.deleteInvoice(id).subscribe(() => {
      this.api.getInvoiceStats().subscribe(s => this.stats = s);
      this.search();
    });
  }

  private today(): string {
    const d = new Date();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');

    return `${d.getFullYear()}-${month}-${day}`;
  }
}