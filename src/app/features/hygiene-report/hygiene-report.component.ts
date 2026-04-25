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
          <button type="button" class="btn-primary-pro action-lg" (click)="exportPdf()">📄 Export PDF hygiène</button>
        </div>
      </form>
    </div>
  `
})
export class HygieneReportComponent {
  private api = inject(ApiService);
  private fb = inject(FormBuilder);

  form = this.fb.nonNullable.group({ day: '', month: '', year: 0 });

  exportPdf(): void {
    const v = this.form.getRawValue();
    const filters: any = {};
    if (v.day) filters.day = v.day;
    if (v.month) filters.month = v.month;
    if (v.year && v.year > 0) filters.year = v.year;

    this.api.downloadHygieneReport(filters).subscribe(blob => {
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'hygiene-report.pdf';
      a.click();
      window.URL.revokeObjectURL(url);
    });
  }
}
