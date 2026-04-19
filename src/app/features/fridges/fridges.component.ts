import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { ApiService, Fridge, FridgeProof } from '../../core/api.service';
import { FilePickerComponent } from '../../shared/file-picker.component';

@Component({
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FilePickerComponent],
  template: `
    <section class="page-top">
      <div>
        <h1>Frigos</h1>
        <p>Ajout rapide des relevés et lecture claire des plages de température.</p>
      </div>
      <button type="button" class="btn-primary-pro action-lg" (click)="openModal()">Nouveau frigo</button>
    </section>

    <div class="entity-toolbar">
      <div class="toolbar-pill">🟢 Actions terrain rapides</div>
      <div class="toolbar-help">Clique sur un frigo pour ajouter un relevé photo immédiatement.</div>
    </div>

    <div class="cards-grid">
      <div class="entity-card fridge-card" *ngFor="let fridge of fridges">
        <div class="entity-head">
          <div>
            <strong>{{ fridge.name }}</strong>
            <p class="entity-subtitle">{{ fridge.location || 'Sans emplacement' }}</p>
          </div>
          <span class="badge" [class.red]="fridge.status === 'INACTIVE'">
            {{ fridge.status === 'INACTIVE' ? 'Inactif' : 'Actif' }}
          </span>
        </div>

        <div class="metric-strip">
          <div class="metric-box">
            <span>Min</span>
            <strong>{{ fridge.minTemp }}°C</strong>
          </div>
          <div class="metric-box">
            <span>Max</span>
            <strong>{{ fridge.maxTemp }}°C</strong>
          </div>
        </div>

        <div class="action-grid">
          <button type="button" class="action-btn primary" (click)="openProofModal(fridge)">📷 Nouveau relevé</button>
          <button type="button" class="action-btn" (click)="toggleProofs(fridge)">🕘 Historique</button>
          <button type="button" class="action-btn subtle" (click)="disable(fridge.id!)">⛔ Désactiver</button>
        </div>

        <div class="proof-list" *ngIf="selectedFridgeId === fridge.id">
          <div class="proof-card" *ngFor="let proof of proofs">
            <img *ngIf="proof.photoPath" class="preview" [src]="api.publicUrl(proof.photoPath)" alt="">
            <div class="proof-meta-grid">
              <div><span>Température</span><strong>{{ proof.temperature }} °C</strong></div>
              <div><span>Par</span><strong>{{ proof.createdBy }}</strong></div>
            </div>
            <p><strong>Date :</strong> {{ proof.createdAt }}</p>
            <p>{{ proof.comment || '-' }}</p>
          </div>
        </div>
      </div>
    </div>

    <div class="modal-backdrop" *ngIf="showModal">
      <div class="modal-card">
        <div class="modal-head">
          <h3>Nouveau frigo</h3>
          <button class="icon-btn" type="button" (click)="closeModal()">×</button>
        </div>
        <form [formGroup]="form" (ngSubmit)="submit()">
          <div class="form-grid">
            <input formControlName="name" placeholder="Nom du frigo">
            <input formControlName="location" placeholder="Emplacement">
            <input type="number" formControlName="minTemp" placeholder="Temp min">
            <input type="number" formControlName="maxTemp" placeholder="Temp max">
          </div>
          <div class="modal-actions">
            <button type="button" class="btn-secondary-pro" (click)="closeModal()">Annuler</button>
            <button type="submit" class="btn-primary-pro">Enregistrer</button>
          </div>
        </form>
      </div>
    </div>

    <div class="modal-backdrop" *ngIf="showProofModal && currentFridge">
      <div class="modal-card">
        <div class="modal-head">
          <h3>Ajouter un relevé - {{ currentFridge.name }}</h3>
          <button class="icon-btn" type="button" (click)="closeProofModal()">×</button>
        </div>

        <div class="operational-banner">
          <strong>Plage attendue :</strong> {{ currentFridge.minTemp }}°C à {{ currentFridge.maxTemp }}°C
        </div>

        <form [formGroup]="proofForm" (ngSubmit)="submitProof()">
          <div class="form-grid">
            <input type="number" formControlName="temperature" placeholder="Température relevée">
            <input formControlName="createdBy" placeholder="Réalisé par">
            <textarea formControlName="comment" placeholder="Commentaire"></textarea>
          </div>

          <div class="camera-section">
            <app-file-picker
              accept="image/*"
              cameraAccept="image/*"
              cameraLabel="Prendre photo du relevé"
              fileLabel="Importer image"
              (fileSelected)="onProofFilePicked($event)">
            </app-file-picker>
          </div>

          <div class="modal-actions">
            <button type="button" class="btn-secondary-pro" (click)="closeProofModal()">Annuler</button>
            <button type="submit" class="btn-primary-pro action-lg">Valider le relevé</button>
          </div>
        </form>
      </div>
    </div>
  `
})
export class FridgesComponent implements OnInit {
  private apiService = inject(ApiService);
  api = this.apiService;
  private fb = inject(FormBuilder);
  fridges: Fridge[] = [];
  proofs: FridgeProof[] = [];
  selectedFridgeId?: number;
  currentFridge?: Fridge;
  proofFile?: File;
  showModal = false;
  showProofModal = false;

  form = this.fb.nonNullable.group({
    name: '',
    location: '',
    minTemp: 0,
    maxTemp: 4
  });

  proofForm = this.fb.nonNullable.group({
    temperature: 4,
    createdBy: '',
    comment: ''
  });

  ngOnInit(): void { this.load(); }

  load(): void {
    this.api.getFridges().subscribe(data => this.fridges = data);
  }

  openModal(): void { this.showModal = true; }
  closeModal(): void {
    this.showModal = false;
    this.form.reset({ name: '', location: '', minTemp: 0, maxTemp: 4 });
  }

  submit(): void {
    this.api.createFridge(this.form.getRawValue()).subscribe(() => {
      this.closeModal();
      this.load();
    });
  }

  disable(id: number): void {
    this.api.disableFridge(id).subscribe(() => this.load());
  }

  toggleProofs(fridge: Fridge): void {
    if (this.selectedFridgeId === fridge.id) {
      this.selectedFridgeId = undefined;
      this.proofs = [];
      return;
    }
    this.selectedFridgeId = fridge.id;
    this.api.getFridgeProofs(fridge.id!).subscribe(data => this.proofs = data);
  }

  openProofModal(fridge: Fridge): void {
    this.currentFridge = fridge;
    this.showProofModal = true;
  }

  closeProofModal(): void {
    this.showProofModal = false;
    this.currentFridge = undefined;
    this.proofFile = undefined;
    this.proofForm.reset({ temperature: 4, createdBy: '', comment: '' });
  }

  onProofFilePicked(file: File): void {
    this.proofFile = file;
  }

  submitProof(): void {
    if (!this.currentFridge?.id || !this.proofFile) return;
    const value = this.proofForm.getRawValue();
    const fd = new FormData();
    fd.append('temperature', String(value.temperature));
    fd.append('createdBy', value.createdBy);
    fd.append('comment', value.comment);
    fd.append('photo', this.proofFile);
    this.api.createFridgeProof(this.currentFridge.id, fd).subscribe(() => {
      const fridge = this.currentFridge!;
      this.closeProofModal();
      this.selectedFridgeId = fridge.id;
      this.api.getFridgeProofs(fridge.id!).subscribe(data => this.proofs = data);
    });
  }
}
