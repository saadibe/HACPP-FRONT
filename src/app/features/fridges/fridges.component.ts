import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { ApiService, Fridge, FridgeProof, ProofPhoto } from '../../core/api.service';

@Component({
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <section class="page-top">
      <div>
        <h1>Frigos</h1>
        <p>Photos liées proprement avec suppression individuelle et réorganisation.</p>
      </div>
      <button type="button" class="btn-primary-pro action-lg" (click)="openCreateModal()">Nouveau frigo</button>
    </section>

    <div class="cards-grid">
      <div class="entity-card fridge-card" *ngFor="let fridge of fridges">
        <div class="entity-head">
          <div>
            <strong>{{ fridge.name }}</strong>
            <p class="entity-subtitle">{{ fridge.location || 'Sans emplacement' }}</p>
          </div>
          <span class="badge" [class.red]="fridge.status === 'INACTIVE'">{{ fridge.status === 'INACTIVE' ? 'Inactif' : 'Actif' }}</span>
        </div>

        <div class="metric-strip">
          <div class="metric-box"><span>Min</span><strong>{{ fridge.minTemp }}°C</strong></div>
          <div class="metric-box"><span>Max</span><strong>{{ fridge.maxTemp }}°C</strong></div>
        </div>

        <div class="action-grid">
          <button type="button" class="action-btn primary" (click)="openProofModal(fridge)">📷 Nouveau relevé</button>
          <button type="button" class="action-btn" (click)="openEditModal(fridge)">⚙️ Configurer</button>
          <button type="button" class="action-btn" (click)="toggleProofs(fridge)">🕘 Historique</button>
          <button type="button" class="action-btn subtle" (click)="disable(fridge.id!)">⛔ Désactiver</button>
        </div>

        <div class="proof-list" *ngIf="selectedFridgeId === fridge.id">
          <div class="proof-card" *ngFor="let proof of proofs">
            <div class="multi-preview-grid">
              <div class="sortable-photo-card" *ngFor="let photo of proof.photos; let i = index"
                   draggable="true"
                   (dragstart)="onDragStart(i)"
                   (dragover)="$event.preventDefault()"
                   (drop)="onFridgeDrop(proof, i)">
                <img class="preview mini-preview" [src]="api.publicUrl(photo.url)" alt="">
                <div class="photo-actions">
                  <button type="button" class="tiny-btn" *ngIf="i>0" (click)="movePhotoLeft(proof, i, 'fridge')">←</button>
                  <button type="button" class="tiny-btn" *ngIf="i < (proof.photos?.length || 0)-1" (click)="movePhotoRight(proof, i, 'fridge')">→</button>
                  <button type="button" class="tiny-btn danger" (click)="deletePhoto(proof, photo, 'fridge')">✕</button>
                </div>
              </div>
            </div>
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

    <div class="modal-backdrop" *ngIf="showConfigModal">
      <div class="modal-card">
        <div class="modal-head">
          <h3>{{ editingId ? 'Configurer le frigo' : 'Nouveau frigo' }}</h3>
          <button class="icon-btn" type="button" (click)="closeConfigModal()">×</button>
        </div>
        <form [formGroup]="form" (ngSubmit)="submitConfig()">
          <div class="form-grid">
            <input formControlName="name" placeholder="Nom du frigo">
            <input formControlName="location" placeholder="Emplacement">
            <input type="number" formControlName="minTemp" placeholder="Temp min">
            <input type="number" formControlName="maxTemp" placeholder="Temp max">
            <select formControlName="status">
              <option value="ACTIVE">Actif</option>
              <option value="INACTIVE">Inactif</option>
            </select>
          </div>
          <div class="modal-actions">
            <button type="button" class="btn-secondary-pro" (click)="closeConfigModal()">Annuler</button>
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

        <form [formGroup]="proofForm" (ngSubmit)="submitProof()">
          <div class="form-grid">
            <input type="number" formControlName="temperature" placeholder="Température relevée">
            <input formControlName="createdBy" placeholder="Réalisé par">
            <textarea formControlName="comment" placeholder="Commentaire"></textarea>
          </div>

          <div class="camera-section drop-zone"
               (dragover)="onZoneDragOver($event)"
               (dragleave)="onZoneDragLeave($event)"
               (drop)="onFilesDropped($event)">
            <label class="picker-btn">
              📷 Ajouter plusieurs photos
              <input type="file" accept="image/*" multiple (change)="onProofFiles($event)" hidden>
            </label>
            <div class="drop-hint">Glisse-dépose les photos ici</div>
            <div class="file-name" *ngIf="proofFiles.length">{{ proofFiles.length }} photo(s) sélectionnée(s)</div>
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
  proofFiles: File[] = [];
  showConfigModal = false;
  showProofModal = false;
  editingId?: number;
  dragIndex = -1;

  form = this.fb.nonNullable.group({ name: '', location: '', minTemp: 0, maxTemp: 4, status: 'ACTIVE' });
  proofForm = this.fb.nonNullable.group({ temperature: 4, createdBy: '', comment: '' });

  ngOnInit(): void { this.load(); }
  load(): void { this.api.getFridges().subscribe(data => this.fridges = data); }

  openCreateModal(): void { this.editingId = undefined; this.form.reset({ name: '', location: '', minTemp: 0, maxTemp: 4, status: 'ACTIVE' }); this.showConfigModal = true; }
  openEditModal(fridge: Fridge): void {
    this.editingId = fridge.id;
    this.form.reset({ name: fridge.name, location: fridge.location || '', minTemp: fridge.minTemp, maxTemp: fridge.maxTemp, status: fridge.status || 'ACTIVE' });
    this.showConfigModal = true;
  }
  closeConfigModal(): void { this.showConfigModal = false; this.editingId = undefined; }

  submitConfig(): void {
    const payload: any = this.form.getRawValue();
    if (this.editingId) this.api.updateFridge(this.editingId, payload).subscribe(() => { this.closeConfigModal(); this.load(); });
    else this.api.createFridge(payload).subscribe(() => { this.closeConfigModal(); this.load(); });
  }

  disable(id: number): void { this.api.disableFridge(id).subscribe(() => this.load()); }

  toggleProofs(fridge: Fridge): void {
    if (this.selectedFridgeId === fridge.id) { this.selectedFridgeId = undefined; this.proofs = []; return; }
    this.selectedFridgeId = fridge.id;
    this.api.getFridgeProofs(fridge.id!).subscribe(data => this.proofs = data);
  }

  openProofModal(fridge: Fridge): void { this.currentFridge = fridge; this.showProofModal = true; }
  closeProofModal(): void { this.showProofModal = false; this.currentFridge = undefined; this.proofFiles = []; this.proofForm.reset({ temperature: 4, createdBy: '', comment: '' }); }

  onProofFiles(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.proofFiles = Array.from(input.files || []);
  }

  onZoneDragOver(event: DragEvent): void { event.preventDefault(); }
  onZoneDragLeave(event: DragEvent): void { event.preventDefault(); }
  onFilesDropped(event: DragEvent): void {
    event.preventDefault();
    const files = Array.from(event.dataTransfer?.files || []).filter(f => f.type.startsWith('image/'));
    this.proofFiles = [...this.proofFiles, ...files];
  }

  submitProof(): void {
    if (!this.currentFridge?.id || !this.proofFiles.length) return;
    const value = this.proofForm.getRawValue();
    const fd = new FormData();
    fd.append('temperature', String(value.temperature));
    fd.append('createdBy', value.createdBy);
    fd.append('comment', value.comment);
    this.proofFiles.forEach(f => fd.append('photos', f));
    this.api.createFridgeProof(this.currentFridge.id, fd).subscribe(() => {
      const fridge = this.currentFridge!;
      this.closeProofModal();
      this.selectedFridgeId = fridge.id;
      this.api.getFridgeProofs(fridge.id!).subscribe(data => this.proofs = data);
    });
  }

  onDragStart(index: number): void { this.dragIndex = index; }
  onFridgeDrop(proof: FridgeProof, dropIndex: number): void {
    if (this.dragIndex < 0 || !proof.photos) return;
    const arr = [...proof.photos];
    const [item] = arr.splice(this.dragIndex, 1);
    arr.splice(dropIndex, 0, item);
    proof.photos = arr;
    this.dragIndex = -1;
    this.api.reorderFridgeProofPhotos(proof.id!, arr.map(p => p.id!)).subscribe();
  }
  movePhotoLeft(proof: FridgeProof, index: number, _type: string): void {
    if (!proof.photos || index <= 0) return;
    const arr = [...proof.photos];
    [arr[index - 1], arr[index]] = [arr[index], arr[index - 1]];
    proof.photos = arr;
    this.api.reorderFridgeProofPhotos(proof.id!, arr.map(p => p.id!)).subscribe();
  }
  movePhotoRight(proof: FridgeProof, index: number, _type: string): void {
    if (!proof.photos || index >= arr_len(proof.photos)-1) return;
    const arr = [...proof.photos];
    [arr[index + 1], arr[index]] = [arr[index], arr[index + 1]];
    proof.photos = arr;
    this.api.reorderFridgeProofPhotos(proof.id!, arr.map(p => p.id!)).subscribe();
  }
  deletePhoto(proof: FridgeProof, photo: ProofPhoto, _type: string): void {
    this.api.deleteProofPhoto(photo.id!).subscribe(() => {
      proof.photos = (proof.photos || []).filter(p => p.id !== photo.id);
    });
  }
}
function arr_len<T>(a: T[]): number { return a.length; }
