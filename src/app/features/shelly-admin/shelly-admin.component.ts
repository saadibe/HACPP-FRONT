import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ApiService, Fridge, ShellyDeviceDto } from '../../core/api.service';

@Component({
  selector: 'app-shelly-admin',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <section class="page-top">
      <div>
        <h1>Sondes Shelly</h1>
        <p>Associer un capteur Shelly à un frigo précis.</p>
      </div>
    </section>

    <div class="grid">
      <section class="card">
        <h2>{{ editingId ? 'Modifier association' : 'Nouvelle association' }}</h2>

        <form [formGroup]="form" (ngSubmit)="save()" class="form">
          <label>
            Restaurant ID
            <input type="number" formControlName="restaurantId" (change)="loadDetectedDevices(); loadDevices()">
          </label>

          <label>
            Device ID Shelly
            <select formControlName="deviceId">
              <option *ngFor="let d of detectedDevices"
                      [value]="d.deviceId">

                {{ d.deviceId }}

              </option>
            </select>
          </label>

          <label>
            Frigo associé
            <select formControlName="fridgeId">
              <option [ngValue]="null">Choisir un frigo</option>
              <option *ngFor="let f of fridges" [ngValue]="f.id">
                {{ f.name }} - {{ f.location || 'Sans emplacement' }}
              </option>
            </select>
          </label>

          <label class="check">
            <input type="checkbox" formControlName="active">
            Actif
          </label>

          <button type="submit" [disabled]="form.invalid || loading">
            {{ loading ? 'Enregistrement...' : 'Enregistrer' }}
          </button>

          <button type="button" class="secondary" *ngIf="editingId" (click)="cancelEdit()">
            Annuler modification
          </button>

          <p class="success" *ngIf="success">{{ success }}</p>
          <p class="error" *ngIf="error">{{ error }}</p>
        </form>
      </section>

      <section class="card">
        <h2>Associations existantes</h2>

        <table>
          <thead>
            <tr>
              <th>Device ID</th>
              <th>Restaurant</th>
              <th>Frigo</th>
              <th>Statut</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            <tr *ngFor="let d of devices">
              <td><code>{{ d.deviceId }}</code></td>
              <td>{{ d.restaurantName || d.restaurantId }}</td>
              <td>{{ d.fridgeName || d.fridgeId }}</td>
              <td>
                <span class="status" [class.off]="!d.active">
                  {{ d.active ? 'Actif' : 'Inactif' }}
                </span>
              </td>
              <td>
                <button class="small" type="button" (click)="edit(d)">Modifier</button>
                <button class="small danger" type="button" (click)="remove(d)">Supprimer</button>
              </td>
            </tr>

            <tr *ngIf="devices.length === 0">
              <td colspan="5" class="empty">Aucune association.</td>
            </tr>
          </tbody>
        </table>
      </section>
    </div>
  `,
  styles: [`
    .page-top {
      margin-bottom: 18px;
    }

    h1 {
      margin: 0;
      font-size: 30px;
      color: #08264a;
    }

    p {
      color: #64748b;
      margin: 4px 0 0;
    }

    .grid {
      display: grid;
      grid-template-columns: 420px 1fr;
      gap: 20px;
    }

    .card {
      background: white;
      border: 1px solid #e2e8f0;
      border-radius: 22px;
      padding: 22px;
      box-shadow: 0 14px 35px rgba(15, 23, 42, .08);
    }

    h2 {
      margin: 0 0 18px;
      color: #0f172a;
    }

    .form {
      display: grid;
      gap: 14px;
    }

    label {
      display: grid;
      gap: 7px;
      font-size: 13px;
      font-weight: 800;
      color: #334155;
    }

    input, select {
      height: 46px;
      border-radius: 14px;
      border: 1px solid #dbe3ee;
      padding: 0 14px;
      font-size: 14px;
      background: #f8fafc;
      outline: none;
    }

    input:focus, select:focus {
      border-color: #0f4c81;
      background: white;
      box-shadow: 0 0 0 4px rgba(15, 76, 129, .12);
    }

    .check {
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .check input {
      width: 18px;
      height: 18px;
    }

    button {
      height: 46px;
      border: none;
      border-radius: 14px;
      background: #0f4c81;
      color: white;
      font-weight: 900;
      cursor: pointer;
    }

    button:disabled {
      opacity: .55;
      cursor: not-allowed;
    }

    .secondary {
      background: #e2e8f0;
      color: #0f172a;
    }

    table {
      width: 100%;
      border-collapse: collapse;
    }

    th {
      text-align: left;
      padding: 12px;
      background: #f8fafc;
      color: #64748b;
      font-size: 12px;
      text-transform: uppercase;
      letter-spacing: .06em;
    }

    td {
      padding: 14px 12px;
      border-bottom: 1px solid #eef2f7;
      font-weight: 700;
    }

    code {
      background: #f1f5f9;
      padding: 5px 9px;
      border-radius: 9px;
    }

    .status {
      display: inline-flex;
      padding: 6px 10px;
      border-radius: 999px;
      background: #dcfce7;
      color: #166534;
      font-size: 12px;
      font-weight: 900;
    }

    .status.off {
      background: #fee2e2;
      color: #991b1b;
    }

    .small {
      height: 34px;
      padding: 0 10px;
      border-radius: 10px;
      margin-right: 6px;
      font-size: 12px;
    }

    .danger {
      background: #dc2626;
    }

    .success {
      color: #15803d;
      font-weight: 800;
    }

    .error {
      color: #dc2626;
      font-weight: 800;
    }

    .empty {
      text-align: center;
      color: #94a3b8;
      padding: 28px;
    }

    @media (max-width: 900px) {
      .grid {
        grid-template-columns: 1fr;
      }

      .card {
        padding: 16px;
      }
    }
  `]
})
export class ShellyAdminComponent implements OnInit {
  private api = inject(ApiService);
  private fb = inject(FormBuilder);

  fridges: Fridge[] = [];
  devices: ShellyDeviceDto[] = [];

  loading = false;
  success = '';
  error = '';
  editingId?: number;

  form = this.fb.nonNullable.group({
    restaurantId: [1, Validators.required],
    deviceId: ['', Validators.required],
    fridgeId: [0, Validators.required],
    active: true
  });

  ngOnInit(): void {
    this.loadFridges();
    this.loadDevices();
    this.loadDetectedDevices();
  }

  loadFridges(): void {
    this.api.getFridges().subscribe({
      next: data => this.fridges = data,
      error: () => this.error = 'Impossible de charger les frigos.'
    });
  }

  loadDevices(): void {
    const restaurantId = this.form.getRawValue().restaurantId;

    this.api.getShellyDevices(restaurantId).subscribe({
      next: data => this.devices = data,
      error: () => this.error = 'Impossible de charger les sondes Shelly.'
    });
  }

  save(): void {
    if (this.form.invalid) return;

    this.loading = true;
    this.success = '';
    this.error = '';

    const value = this.form.getRawValue();

    const payload = {
      restaurantId: Number(value.restaurantId),
      deviceId: value.deviceId.trim().toLowerCase(),
      fridgeId: Number(value.fridgeId),
      active: value.active
    };

    const request$ = this.editingId
      ? this.api.updateShellyDevice(this.editingId, payload)
      : this.api.createShellyDevice(payload);

    request$.subscribe({
      next: () => {
        this.success = this.editingId
          ? 'Association modifiée avec succès.'
          : 'Shelly associé au frigo avec succès.';

        this.loading = false;
        this.cancelEdit();
        this.loadDevices();
      },
      error: err => {
        this.error = err?.error?.message || 'Erreur pendant l’enregistrement.';
        this.loading = false;
      }
    });
  }

  edit(device: ShellyDeviceDto): void {
    this.editingId = device.id;

    this.form.reset({
      restaurantId: device.restaurantId,
      deviceId: device.deviceId,
      fridgeId: device.fridgeId,
      active: device.active
    });
  }

  cancelEdit(): void {
    this.editingId = undefined;

    this.form.reset({
      restaurantId: 1,
      deviceId: '',
      fridgeId: 0,
      active: true
    });
  }
detectedDevices: any[] = [];

loadDetectedDevices(): void {
  const restaurantId = this.form.getRawValue().restaurantId;

  this.api.getDetectedShellyDevices(restaurantId).subscribe({
    next: data => this.detectedDevices = data,
    error: () => this.error = 'Impossible de charger les Shelly détectés.'
  });
}
  remove(device: ShellyDeviceDto): void {
    if (!device.id) return;

    const ok = confirm(`Supprimer l'association Shelly ${device.deviceId} ?`);
    if (!ok) return;

    this.api.deleteShellyDevice(device.id).subscribe({
      next: () => {
        this.success = 'Association supprimée.';
        this.loadDevices();
      },
      error: () => this.error = 'Erreur pendant la suppression.'
    });
  }
}