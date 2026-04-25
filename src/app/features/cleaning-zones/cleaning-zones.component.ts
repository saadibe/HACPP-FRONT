import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { ApiService, CleaningProof, CleaningZone, ProofPhoto } from '../../core/api.service';

@Component({
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <section class="page-top">
      <div>
        <h1>Zones de nettoyage</h1>
        <p>Suppression photo par photo et réorganisation facile.</p>
      </div>
      <button type="button" class="btn-primary-pro action-lg" (click)="openZoneModal()">Nouvelle zone</button>
    </section>

    <div class="cards-grid">
      <div class="entity-card cleaning-card" *ngFor="let zone of zones">
        <div class="entity-head">
          <div>
            <strong>{{ zone.name }}</strong>
            <p class="entity-subtitle">{{ zone.description || 'Sans description' }}</p>
          </div>
          <span class="badge">{{ zone.scheduledTime }}</span>
        </div>

        <div class="action-grid">
          <button type="button" class="action-btn primary" (click)="openProofModal(zone)">📷 Nouvelle preuve</button>
          <button type="button" class="action-btn" (click)="toggleProofs(zone)">🕘 Voir preuves</button>
        </div>

        <div class="proof-list" *ngIf="selectedZoneId === zone.id">
          <div class="proof-card" *ngFor="let proof of proofs">
            <div class="multi-preview-grid">
              <div class="sortable-photo-card" *ngFor="let photo of proof.photos; let i = index"
                   draggable="true"
                   (dragstart)="onDragStart(i)"
                   (dragover)="$event.preventDefault()"
                   (drop)="onCleaningDrop(proof, i)">
                <img class="preview mini-preview" [src]="api.publicUrl(photo.url)" alt="">
                <div class="photo-actions">
                  <button type="button" class="tiny-btn" *ngIf="i>0" (click)="movePhotoLeft(proof, i)">←</button>
                  <button type="button" class="tiny-btn" *ngIf="i < (proof.photos?.length || 0)-1" (click)="movePhotoRight(proof, i)">→</button>
                  <button type="button" class="tiny-btn danger" (click)="deletePhoto(proof, photo)">✕</button>
                </div>
              </div>
            </div>
            <div class="proof-meta-grid">
              <div><span>Par</span><strong>{{ proof.createdBy }}</strong></div>
              <div><span>Date</span><strong>{{ proof.createdAt }}</strong></div>
            </div>
            <p>{{ proof.comment || '-' }}</p>
          </div>
        </div>
      </div>
    </div>

    <div class="modal-backdrop" *ngIf="showZoneModal">
      <div class="modal-card">
        <div class="modal-head">
          <h3>Nouvelle zone de nettoyage</h3>
          <button class="icon-btn" type="button" (click)="closeZoneModal()">×</button>
        </div>
        <form [formGroup]="zoneForm" (ngSubmit)="submitZone()">
          <div class="form-grid">
            <input formControlName="name" placeholder="Nom de la zone">
            <input formControlName="scheduledTime" type="time" placeholder="Heure de nettoyage">
            <textarea formControlName="description" placeholder="Description"></textarea>
          </div>
          <div class="modal-actions">
            <button type="button" class="btn-secondary-pro" (click)="closeZoneModal()">Annuler</button>
            <button type="submit" class="btn-primary-pro">Enregistrer</button>
          </div>
        </form>
      </div>
    </div>

    <div class="modal-backdrop" *ngIf="showProofModal && currentZone">
      <div class="modal-card">
        <div class="modal-head">
          <h3>Ajouter une preuve - {{ currentZone.name }}</h3>
          <button class="icon-btn" type="button" (click)="closeProofModal()">×</button>
        </div>

        <form [formGroup]="proofForm" (ngSubmit)="submitProof()">
          <div class="form-grid">
            <input formControlName="createdBy" placeholder="Réalisé par">
            <textarea formControlName="comment" placeholder="Commentaire"></textarea>
          </div>

<div class="camera-section drop-zone"
     (dragover)="onZoneDragOver($event)"
     (dragleave)="onZoneDragLeave($event)"
     (drop)="onFilesDropped($event)">

  <div class="drop-zone-actions">
    <label class="icon-action" title="Prendre une photo">
      📷
      <input
        type="file"
        accept="image/*"
        capture="environment"
        (change)="onProofFiles($event)"
        hidden>
    </label>

    <label class="icon-action" title="Importer plusieurs photos">
      📎
      <input
        type="file"
        accept="image/*"
        multiple
        (change)="onProofFiles($event)"
        hidden>
    </label>

    <span class="file-counter">
      {{ proofFiles.length }} photo(s)
    </span>
  </div>

  <div class="photo-grid" *ngIf="proofFiles.length">
    <div class="sortable-photo-card" *ngFor="let file of proofFiles; let i = index">
      <div class="file-name">{{ file.name }}</div>
      <button type="button" class="tiny-btn danger" (click)="removeProofFile(i)">
        ✕
      </button>
    </div>
  </div>

  <div class="drop-hint">
    Tu peux prendre une photo, puis revenir et prendre une deuxième dans la même preuve.
  </div>
</div>

          <div class="modal-actions">
            <button type="button" class="btn-secondary-pro" (click)="closeProofModal()">Annuler</button>
            <button type="submit" class="btn-primary-pro action-lg">Valider la preuve</button>
          </div>
        </form>
      </div>
    </div>
  `
})
export class CleaningZonesComponent implements OnInit {
  private apiService = inject(ApiService);
  api = this.apiService;
  private fb = inject(FormBuilder);

  zones: CleaningZone[] = [];
  proofs: CleaningProof[] = [];
  selectedZoneId?: number;
  currentZone?: CleaningZone;
  proofFiles: File[] = [];
  dragIndex = -1;

  showZoneModal = false;
  showProofModal = false;

  zoneForm = this.fb.nonNullable.group({ name: '', description: '', scheduledTime: '15:00' });
  proofForm = this.fb.nonNullable.group({ createdBy: '', comment: '' });

  ngOnInit(): void { this.loadZones(); }
  loadZones(): void { this.api.getCleaningZones().subscribe(data => this.zones = data); }

  openZoneModal(): void { this.showZoneModal = true; }
  closeZoneModal(): void { this.showZoneModal = false; this.zoneForm.reset({ name: '', description: '', scheduledTime: '15:00' }); }

  submitZone(): void {
    this.api.createCleaningZone(this.zoneForm.getRawValue()).subscribe(() => { this.closeZoneModal(); this.loadZones(); });
  }

  toggleProofs(zone: CleaningZone): void {
    if (this.selectedZoneId === zone.id) { this.selectedZoneId = undefined; this.proofs = []; return; }
    this.selectedZoneId = zone.id;
    this.api.getCleaningProofs(zone.id!).subscribe(data => this.proofs = data);
  }

  openProofModal(zone: CleaningZone): void { this.currentZone = zone; this.showProofModal = true; }
  closeProofModal(): void { this.showProofModal = false; this.currentZone = undefined; this.proofFiles = []; this.proofForm.reset({ createdBy: '', comment: '' }); }

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
    if (!this.currentZone?.id || !this.proofFiles.length) return;
    const value = this.proofForm.getRawValue();
    const fd = new FormData();
    fd.append('createdBy', value.createdBy);
    fd.append('comment', value.comment);
    this.proofFiles.forEach(f => fd.append('photos', f));
    this.api.createCleaningProof(this.currentZone.id, fd).subscribe(() => {
      const zone = this.currentZone!;
      this.closeProofModal();
      this.selectedZoneId = zone.id;
      this.api.getCleaningProofs(zone.id!).subscribe(data => this.proofs = data);
    });
  }

  onDragStart(index: number): void { this.dragIndex = index; }
  onCleaningDrop(proof: CleaningProof, dropIndex: number): void {
    if (this.dragIndex < 0 || !proof.photos) return;
    const arr = [...proof.photos];
    const [item] = arr.splice(this.dragIndex, 1);
    arr.splice(dropIndex, 0, item);
    proof.photos = arr;
    this.dragIndex = -1;
    this.api.reorderCleaningProofPhotos(proof.id!, arr.map(p => p.id!)).subscribe();
  }
  movePhotoLeft(proof: CleaningProof, index: number): void {
    if (!proof.photos || index <= 0) return;
    const arr = [...proof.photos];
    [arr[index - 1], arr[index]] = [arr[index], arr[index - 1]];
    proof.photos = arr;
    this.api.reorderCleaningProofPhotos(proof.id!, arr.map(p => p.id!)).subscribe();
  }
  movePhotoRight(proof: CleaningProof, index: number): void {
    if (!proof.photos || index >= arr_len(proof.photos)-1) return;
    const arr = [...proof.photos];
    [arr[index + 1], arr[index]] = [arr[index], arr[index + 1]];
    proof.photos = arr;
    this.api.reorderCleaningProofPhotos(proof.id!, arr.map(p => p.id!)).subscribe();
  }
  deletePhoto(proof: CleaningProof, photo: ProofPhoto): void {
    this.api.deleteProofPhoto(photo.id!).subscribe(() => {
      proof.photos = (proof.photos || []).filter(p => p.id !== photo.id);
    });
  }
}
function arr_len<T>(a: T[]): number { return a.length; }
