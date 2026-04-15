import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { ApiService, CleaningPlan } from '../../core/api.service';

@Component({
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <section class="page-top">
      <div>
        <h1>Plan de nettoyage</h1>
        <p>Suivi visuel des zones nettoyées avec photo.</p>
      </div>
      <button type="button" (click)="openModal()">Ajouter un plan</button>
    </section>

    <div class="cards-grid">
      <div class="entity-card" *ngFor="let item of plans">
        <div class="entity-head">
          <strong>{{ item.workstationName }}</strong>
          <span class="badge">{{ item.checkType }}</span>
        </div>
        <p>Réalisé par : {{ item.createdBy }}</p>
        <p>{{ item.comment || '-' }}</p>
        <img *ngIf="item.photoPath" class="preview" [src]="api.publicUrl(item.photoPath)" alt="">
      </div>
    </div>

    <div class="modal-backdrop" *ngIf="showModal">
      <div class="modal-card">
        <div class="modal-head">
          <h3>Nouveau plan de nettoyage</h3>
          <button class="icon-btn" type="button" (click)="closeModal()">×</button>
        </div>
        <form [formGroup]="form" (ngSubmit)="submit()">
          <div class="form-grid">
            <input formControlName="workstationName" placeholder="Zone ou poste">
            <select formControlName="checkType">
              <option value="BEFORE_SERVICE">Avant service</option>
              <option value="DURING_SERVICE">Pendant service</option>
              <option value="AFTER_CLEANING">Après nettoyage</option>
            </select>
            <input formControlName="createdBy" placeholder="Réalisé par">
            <textarea formControlName="comment" placeholder="Commentaire"></textarea>
            <input type="file" (change)="onFile($event)" accept="image/*">
          </div>
          <div class="modal-actions">
            <button type="button" class="secondary" (click)="closeModal()">Annuler</button>
            <button type="submit">Enregistrer</button>
          </div>
        </form>
      </div>
    </div>
  `
})
export class CleaningPlansComponent implements OnInit {
  readonly api = inject(ApiService);
  private fb = inject(FormBuilder);
  plans: CleaningPlan[] = [];
  file?: File;
  showModal = false;

  form = this.fb.nonNullable.group({
    workstationName: '',
    checkType: 'AFTER_CLEANING',
    createdBy: '',
    comment: ''
  });

  ngOnInit(): void { this.load(); }

  load(): void {
    this.api.getCleaningPlans().subscribe(data => this.plans = data);
  }

  openModal(): void { this.showModal = true; }

  closeModal(): void {
    this.showModal = false;
    this.file = undefined;
    this.form.reset({ workstationName: '', checkType: 'AFTER_CLEANING', createdBy: '', comment: '' });
  }

  onFile(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.file = input.files?.[0];
  }

  submit(): void {
    if (!this.file) return;
    const value = this.form.getRawValue();
    const fd = new FormData();
    fd.append('workstationName', value.workstationName);
    fd.append('checkType', value.checkType);
    fd.append('createdBy', value.createdBy);
    fd.append('comment', value.comment);
    fd.append('photo', this.file);
    this.api.createCleaningPlan(fd).subscribe(() => {
      this.closeModal();
      this.load();
    });
  }
}
