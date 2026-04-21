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
        <p>Export PDF complet avec preuves et dates.</p>
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
          <a class="action-btn primary link-btn action-lg" [href]="reportUrl()" target="_blank">
            📄 Export PDF hygiène
          </a>
        </div>
      </form>
    </div>
  `
})
export class HygieneReportComponent {
  private api = inject(ApiService);
  private fb = inject(FormBuilder);

  form = this.fb.nonNullable.group({
    day: '',
    month: '',
    year: 0
  });

  reportUrl(): string {
    const v = this.form.getRawValue();
    const filters: any = {};
    if (v.day) filters.day = v.day;
    if (v.month) filters.month = v.month;
    if (v.year && v.year > 0) filters.year = v.year;
    return this.api.hygieneReportUrl(filters);
  }
}
