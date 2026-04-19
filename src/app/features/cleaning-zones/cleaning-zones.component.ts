import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { ApiService, CleaningProof, CleaningZone } from '../../core/api.service';
import { FilePickerComponent } from '../../shared/file-picker.component';

@Component({
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FilePickerComponent],
  template: `
    <section class="page-top">
      <div>
        <h1>Zones de nettoyage</h1>
        <p>Création des zones et ajout de preuves photo en quelques secondes.</p>
      </div>
      <button type="button" class="btn-primary-pro action-lg" (click)="openZoneModal()">Nouvelle zone</button>
    </section>

    <div class="entity-toolbar">
      <div class="toolbar-pill">🧼 Routine nettoyage</div>
      <div class="toolbar-help">Chaque zone affiche son heure prévue et ses preuves récentes.</div>
    </div>

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
            <img *ngIf="proof.photoPath" class="preview" [src]="api.publicUrl(proof.photoPath)" alt="">
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

        <div class="operational-banner">
          <strong>Heure prévue :</strong> {{ currentZone.scheduledTime }}
        </div>

        <form [formGroup]="proofForm" (ngSubmit)="submitProof()">
          <div class="form-grid">
            <input formControlName="createdBy" placeholder="Réalisé par">
            <textarea formControlName="comment" placeholder="Commentaire"></textarea>
          </div>

          <div class="camera-section">
            <app-file-picker
              accept="image/*"
              cameraAccept="image/*"
              cameraLabel="Prendre photo de preuve"
              fileLabel="Importer image"
              (fileSelected)="onProofFilePicked($event)">
            </app-file-picker>
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
  proofFile?: File;

  showZoneModal = false;
  showProofModal = false;

  zoneForm = this.fb.nonNullable.group({
    name: '',
    description: '',
    scheduledTime: '15:00'
  });

  proofForm = this.fb.nonNullable.group({
    createdBy: '',
    comment: ''
  });

  ngOnInit(): void { this.loadZones(); }

  loadZones(): void {
    this.api.getCleaningZones().subscribe(data => this.zones = data);
  }

  openZoneModal(): void { this.showZoneModal = true; }
  closeZoneModal(): void {
    this.showZoneModal = false;
    this.zoneForm.reset({ name: '', description: '', scheduledTime: '15:00' });
  }

  submitZone(): void {
    this.api.createCleaningZone(this.zoneForm.getRawValue()).subscribe(() => {
      this.closeZoneModal();
      this.loadZones();
    });
  }

  toggleProofs(zone: CleaningZone): void {
    if (this.selectedZoneId === zone.id) {
      this.selectedZoneId = undefined;
      this.proofs = [];
      return;
    }
    this.selectedZoneId = zone.id;
    this.api.getCleaningProofs(zone.id!).subscribe(data => this.proofs = data);
  }

  openProofModal(zone: CleaningZone): void {
    this.currentZone = zone;
    this.showProofModal = true;
  }

  closeProofModal(): void {
    this.showProofModal = false;
    this.currentZone = undefined;
    this.proofFile = undefined;
    this.proofForm.reset({ createdBy: '', comment: '' });
  }

  onProofFilePicked(file: File): void {
    this.proofFile = file;
  }

  submitProof(): void {
    if (!this.currentZone?.id || !this.proofFile) return;
    const value = this.proofForm.getRawValue();
    const fd = new FormData();
    fd.append('createdBy', value.createdBy);
    fd.append('comment', value.comment);
    fd.append('photo', this.proofFile);

    this.api.createCleaningProof(this.currentZone.id, fd).subscribe(() => {
      const zone = this.currentZone!;
      this.closeProofModal();
      this.selectedZoneId = zone.id;
      this.api.getCleaningProofs(zone.id!).subscribe(data => this.proofs = data);
    });
  }
}
