import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { ApiService, Check } from '../../core/api.service';

@Component({
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <h2>Contrôles des plans de travail</h2>
    <div class="card">
      <form [formGroup]="form" (ngSubmit)="submit()">
        <input formControlName="workstationName" placeholder="Poste">
        <select formControlName="checkType">
          <option value="BEFORE_SERVICE">Avant service</option>
          <option value="DURING_SERVICE">Pendant service</option>
          <option value="AFTER_CLEANING">Après nettoyage</option>
        </select>
        <input formControlName="createdBy" placeholder="Auteur">
        <textarea formControlName="comment" placeholder="Commentaire"></textarea>
        <input type="file" (change)="onFile($event)" accept="image/*">
        <button type="submit">Enregistrer</button>
      </form>
    </div>

    <div class="grid">
      <div class="card" *ngFor="let item of checks">
        <strong>{{ item.workstationName }}</strong>
        <p>{{ item.checkType }}</p>
        <p>{{ item.createdBy }}</p>
        <p>{{ item.comment || '-' }}</p>
        <img *ngIf="item.photoPath" class="preview" [src]="api.publicUrl(item.photoPath)" alt="">
      </div>
    </div>
  `
})
export class ChecksComponent implements OnInit {
  readonly api = inject(ApiService);
  private fb = inject(FormBuilder);
  checks: Check[] = [];
  file?: File;

  form = this.fb.nonNullable.group({
    workstationName: '',
    checkType: 'AFTER_CLEANING',
    createdBy: '',
    comment: ''
  });

  ngOnInit(): void { this.load(); }

  load(): void {
    this.api.getChecks().subscribe(data => this.checks = data);
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
    this.api.createCheck(fd).subscribe(() => {
      this.form.reset({ workstationName: '', checkType: 'AFTER_CLEANING', createdBy: '', comment: '' });
      this.file = undefined;
      this.load();
    });
  }
}
