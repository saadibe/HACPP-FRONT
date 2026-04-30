import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { ApiService } from '../../core/api.service';

@Component({
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <section class="page-top">
      <div>
        <h1>Contrôle hygiène</h1>
        <p>Export PDF authentifié avec toutes les preuves datées.</p>
      </div>
    </section>

    <div class="card">
      <form [formGroup]="form">
        <div class="form-grid">
          <input type="date" formControlName="day">
          <input type="month" formControlName="month">
          <input type="number" formControlName="year" placeholder="Année">
        </div>

        <div class="modal-actions">
          <button type="button" class="btn-primary-pro action-lg" (click)="sendByEmail()" [disabled]="sendingEmail">
            {{ sendingEmail ? 'Envoi en cours...' : '📧 Envoyer par email' }}
          </button>
        </div>

        <p class="success" *ngIf="success">{{ success }}</p>
        <p class="error" *ngIf="error">{{ error }}</p>
      </form>
    </div>
  `,
  styles: [`
    .success {
      margin-top: 14px;
      color: #15803d;
      font-weight: 800;
    }

    .error {
      margin-top: 14px;
      color: #dc2626;
      font-weight: 800;
    }
  `]
})
export class HygieneReportComponent {
  private api = inject(ApiService);
  private fb = inject(FormBuilder);

  sendingEmail = false;
  success = '';
  error = '';

  form = this.fb.nonNullable.group({
    day: '',
    month: '',
    year: 0
  });
  sendByEmail(): void {
    const filters = this.buildFilters();

    this.sendingEmail = true;
    this.success = '';
    this.error = '';

    this.api.sendHygieneReportByEmail(filters).subscribe({
      next: (res: { message: string }) => {
        this.success = res.message || 'Le rapport est bien envoyé. Vérifiez votre boîte email.';
        this.sendingEmail = false;
      },
      error: (err: any) => {
        this.error = err?.error?.message || 'Erreur pendant l’envoi du rapport.';
        this.sendingEmail = false;
      }
    });
  }

  private buildFilters(): any {
    const v = this.form.getRawValue();
    const filters: any = {};

    if (v.day) filters.day = v.day;
    if (v.month) filters.month = v.month;
    if (v.year && v.year > 0) filters.year = v.year;

    return filters;
  }
}