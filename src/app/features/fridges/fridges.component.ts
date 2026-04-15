import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { ApiService, Fridge, FridgeProof } from '../../core/api.service';

@Component({
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <section class="page-top">
      <div>
        <h1>Frigos</h1>
        <p>Gestion des enceintes froides et relevés photo.</p>
      </div>
      <button type="button" (click)="openModal()">Ajouter un frigo</button>
    </section>

    <div class="cards-grid">
      <div class="entity-card" *ngFor="let fridge of fridges">
        <div class="entity-head">
          <strong>{{ fridge.name }}</strong>
          <span class="badge" [class.red]="fridge.status === 'INACTIVE'">
            {{ fridge.status === 'INACTIVE' ? 'Inactif' : 'Actif' }}
          </span>
        </div>
        <p>{{ fridge.location || '-' }}</p>
        <p>{{ fridge.minTemp }}°C → {{ fridge.maxTemp }}°C</p>
        <div class="row actions-row">
          <button type="button" class="secondary" (click)="openProofModal(fridge)">Ajouter relevé</button>
          <button type="button" class="secondary" (click)="toggleProofs(fridge)">Voir relevés</button>
          <button type="button" class="secondary" (click)="disable(fridge.id!)">Désactiver</button>
        </div>

        <div class="proof-list" *ngIf="selectedFridgeId === fridge.id">
          <div class="proof-card" *ngFor="let proof of proofs">
            <img *ngIf="proof.photoPath" class="preview" [src]="api.publicUrl(proof.photoPath)" alt="">
            <p><strong>Température :</strong> {{ proof.temperature }} °C</p>
            <p><strong>Par :</strong> {{ proof.createdBy }}</p>
            <p><strong>Date :</strong> {{ proof.createdAt }}</p>
            <p>{{ proof.comment || '-' }}</p>
          </div>
        </div>
      </div>
    </div>

    <div class="modal-backdrop" *ngIf="showModal">
      <div class="modal-card">
        <div class="modal-head">
          <h3>Ajouter un frigo</h3>
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
            <button type="button" class="secondary" (click)="closeModal()">Annuler</button>
            <button type="submit">Enregistrer</button>
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
        <form [formGroup]="proofForm" (ngSubmit)="submitProof()">
          <div class="form-grid">
            <input type="number" formControlName="temperature" placeholder="Température relevée">
            <input formControlName="createdBy" placeholder="Réalisé par">
            <textarea formControlName="comment" placeholder="Commentaire"></textarea>
            <input type="file" (change)="onProofFile($event)" accept="image/*">
          </div>
          <div class="modal-actions">
            <button type="button" class="secondary" (click)="closeProofModal()">Annuler</button>
            <button type="submit">Ajouter le relevé</button>
          </div>
        </form>
      </div>
    </div>
  `,
  styles: [`
    .proof-list { margin-top: 16px; display: grid; gap: 12px; }
    .proof-card { padding: 14px; border: 1px solid #e5e7eb; border-radius: 16px; background: #f8fafc; }
    .clickable { cursor: pointer; }
  `]
})
export class FridgesComponent implements OnInit {
  private api = inject(ApiService);
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

  onProofFile(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.proofFile = input.files?.[0];
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
