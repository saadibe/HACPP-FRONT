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
        <p>Crée les zones, l'heure de nettoyage, puis ajoute des preuves photo datées.</p>
      </div>
      <button type="button" class="btn-primary-pro" (click)="openZoneModal()">Ajouter une zone</button>
    </section>

    <div class="cards-grid">
      <div class="entity-card" *ngFor="let zone of zones">
        <div class="entity-head">
          <strong>{{ zone.name }}</strong>
          <span class="badge">{{ zone.scheduledTime }}</span>
        </div>
        <p>{{ zone.description || '-' }}</p>
        <div class="row actions-row">
          <button type="button" class="btn-secondary-pro" (click)="openProofModal(zone)">Ajouter preuve</button>
          <button type="button" class="btn-secondary-pro" (click)="toggleProofs(zone)">Voir preuves</button>
        </div>

        <div class="proof-list" *ngIf="selectedZoneId === zone.id">
          <div class="proof-card" *ngFor="let proof of proofs">
            <img *ngIf="proof.photoPath" class="preview" [src]="api.publicUrl(proof.photoPath)" alt="">
            <p><strong>Par :</strong> {{ proof.createdBy }}</p>
            <p><strong>Date :</strong> {{ proof.createdAt }}</p>
            <p>{{ proof.comment || '-' }}</p>
          </div>
        </div>
      </div>
    </div>

    <div class="modal-backdrop" *ngIf="showZoneModal">
      <div class="modal-card">
        <div class="modal-head">
          <h3>Ajouter une zone de nettoyage</h3>
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
            <button type="submit" class="btn-primary-pro">Ajouter la preuve</button>
          </div>
        </form>
      </div>
    </div>
  `,
  styles: [`
    .proof-list { margin-top: 16px; display: grid; gap: 12px; }
    .proof-card { padding: 14px; border: 1px solid #e5e7eb; border-radius: 16px; background: #f8fafc; }
  `]
})
export class CleaningZonesComponent implements OnInit {
  readonly api = inject(ApiService);
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
