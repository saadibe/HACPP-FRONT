import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { ApiService, Batch } from '../../core/api.service';

@Component({
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <section class="page-top">
      <div>
        <h1>Lots / DLC</h1>
        <p>Création de lots avec QR code et impression d'étiquette DLC.</p>
      </div>
      <div class="row top-actions">
        <a [href]="api.reportUrl()" target="_blank"><button type="button">Télécharger PDF</button></a>
        <button type="button" (click)="openModal()">Ajouter un lot</button>
      </div>
    </section>

    <div class="cards-grid">
      <div class="entity-card" *ngFor="let batch of batches">
        <div class="entity-head">
          <strong>{{ batch.productName }}</strong>
          <span class="badge">DLC</span>
        </div>
        <p>{{ batch.category || '-' }}</p>
        <p>Préparé : {{ batch.preparedAt }}</p>
        <p>DLC : {{ batch.dlcAt }}</p>
        <p>{{ batch.storageTemp || '-' }}</p>
        <img *ngIf="batch.qrCodePath" class="qr" [src]="api.publicUrl(batch.qrCodePath)" alt="">
        <div class="row actions-row">
          <button type="button" class="secondary" (click)="printLabel(batch.id!)">Imprimer DLC</button>
        </div>
      </div>
    </div>

    <div class="modal-backdrop" *ngIf="showModal">
      <div class="modal-card">
        <div class="modal-head">
          <h3>Créer un lot DLC</h3>
          <button class="icon-btn" type="button" (click)="closeModal()">×</button>
        </div>
        <form [formGroup]="form" (ngSubmit)="submit()">
          <div class="form-grid">
            <input formControlName="productName" placeholder="Produit">
            <input formControlName="category" placeholder="Catégorie">
            <input type="datetime-local" formControlName="preparedAt">
            <input type="datetime-local" formControlName="dlcAt">
            <input formControlName="storageTemp" placeholder="Conservation">
            <input formControlName="createdBy" placeholder="Préparé par">
          </div>
          <div class="modal-actions">
            <button type="button" class="secondary" (click)="closeModal()">Annuler</button>
            <button type="submit">Créer</button>
          </div>
        </form>
      </div>
    </div>
  `
})
export class BatchesComponent implements OnInit {
  readonly api = inject(ApiService);
  private fb = inject(FormBuilder);
  private router = inject(Router);
  batches: Batch[] = [];
  showModal = false;

  form = this.fb.nonNullable.group({
    productName: '',
    category: '',
    preparedAt: '',
    dlcAt: '',
    storageTemp: '',
    createdBy: ''
  });

  ngOnInit(): void { this.load(); }

  load(): void {
    this.api.getBatches().subscribe(data => this.batches = data);
  }

  openModal(): void { this.showModal = true; }

  closeModal(): void {
    this.showModal = false;
    this.form.reset({ productName: '', category: '', preparedAt: '', dlcAt: '', storageTemp: '', createdBy: '' });
  }

  submit(): void {
    this.api.createBatch(this.form.getRawValue()).subscribe(() => {
      this.closeModal();
      this.load();
    });
  }

  printLabel(id: number): void {
    this.router.navigateByUrl('/batches/print/' + id);
  }
}
