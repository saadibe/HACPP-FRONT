import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ApiService, ClientDto } from '../../core/api.service';

@Component({
  selector: 'app-clients',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="clients-page">
      <div class="page-head">
        <div>
          <div class="badge">SAAS</div>
          <h1>Gestion des clients</h1>
          <p>Créer un nouveau client avec son propre schéma PostgreSQL sécurisé.</p>
        </div>
      </div>

      <div class="grid">
        <section class="card">
          <h2>Nouveau client</h2>

          <form [formGroup]="form" (ngSubmit)="create()" class="form">
            <label>
              Nom restaurant
              <input formControlName="restaurantName" placeholder="Ex: La Perla Bezons">
            </label>

            <label>
              Schéma PostgreSQL
              <input formControlName="schemaName" placeholder="Ex: la_perla_bezons">
            </label>

            <label>
              Admin username
              <input formControlName="adminUsername" placeholder="admin@restaurant.fr">
            </label>

            <label>
              Mot de passe
              <input type="password" formControlName="adminPassword" placeholder="Mot de passe admin">
            </label>

            <button type="submit" [disabled]="form.invalid || loading">
              {{ loading ? 'Création...' : 'Créer le client' }}
            </button>

            <p class="success" *ngIf="success">{{ success }}</p>
            <p class="error" *ngIf="error">{{ error }}</p>
          </form>
        </section>

        <section class="card">
          <h2>Clients existants</h2>

          <div class="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Restaurant</th>
                  <th>Schéma</th>
                  <th>Statut</th>
                </tr>
              </thead>

              <tbody>
                <tr *ngFor="let c of clients">
                  <td>{{ c.restaurantName }}</td>
                  <td><code>{{ c.schemaName }}</code></td>
                  <td>
                    <span class="status" [class.off]="!c.active">
                      {{ c.active ? 'Actif' : 'Inactif' }}
                    </span>
                  </td>
                </tr>

                <tr *ngIf="clients.length === 0">
                  <td colspan="3" class="empty">Aucun client pour le moment.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  `,
  styles: [`
    .clients-page {
      padding: 24px;
      color: #102033;
    }

    .page-head {
      margin-bottom: 22px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .badge {
      display: inline-block;
      padding: 6px 12px;
      border-radius: 999px;
      background: #e8f2ff;
      color: #1263b0;
      font-weight: 800;
      font-size: 12px;
      letter-spacing: .08em;
      margin-bottom: 10px;
    }

    h1 {
      margin: 0;
      font-size: 30px;
      font-weight: 900;
    }

    p {
      margin: 6px 0 0;
      color: #64748b;
    }

    .grid {
      display: grid;
      grid-template-columns: 420px 1fr;
      gap: 20px;
    }

    .card {
      background: #ffffff;
      border: 1px solid #e5e7eb;
      border-radius: 22px;
      padding: 22px;
      box-shadow: 0 18px 45px rgba(15, 23, 42, .08);
    }

    h2 {
      margin: 0 0 18px;
      font-size: 20px;
      font-weight: 850;
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

    input {
      height: 46px;
      border-radius: 14px;
      border: 1px solid #dbe3ee;
      padding: 0 14px;
      font-size: 14px;
      outline: none;
      background: #f8fafc;
    }

    input:focus {
      border-color: #2563eb;
      background: #ffffff;
      box-shadow: 0 0 0 4px rgba(37, 99, 235, .12);
    }

    button {
      height: 48px;
      border: 0;
      border-radius: 15px;
      background: linear-gradient(135deg, #0f5ea8, #0ea5e9);
      color: white;
      font-weight: 900;
      cursor: pointer;
      margin-top: 4px;
    }

    button:disabled {
      opacity: .55;
      cursor: not-allowed;
    }

    .table-wrap {
      overflow-x: auto;
    }

    table {
      width: 100%;
      border-collapse: collapse;
    }

    th {
      text-align: left;
      font-size: 12px;
      text-transform: uppercase;
      letter-spacing: .06em;
      color: #64748b;
      padding: 12px;
      background: #f8fafc;
    }

    td {
      padding: 15px 12px;
      border-bottom: 1px solid #eef2f7;
      font-weight: 700;
    }

    code {
      background: #f1f5f9;
      padding: 5px 9px;
      border-radius: 9px;
      color: #0f172a;
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

    .empty {
      text-align: center;
      color: #94a3b8;
      padding: 30px;
    }

    .success {
      color: #15803d;
      font-weight: 800;
    }

    .error {
      color: #dc2626;
      font-weight: 800;
    }

    @media (max-width: 900px) {
      .grid {
        grid-template-columns: 1fr;
      }

      .clients-page {
        padding: 14px;
      }
    }
  `]
})
export class ClientsComponent implements OnInit {
  private readonly api = inject(ApiService);
  private readonly fb = inject(FormBuilder);

  clients: ClientDto[] = [];
  loading = false;
  success = '';
  error = '';

  form = this.fb.group({
    restaurantName: ['', Validators.required],
    schemaName: [''],
    adminUsername: ['', Validators.required],
    adminPassword: ['', Validators.required],
  });

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.api.getClients().subscribe({
      next: (v: ClientDto[]) => this.clients = v,
      error: () => this.error = 'Impossible de charger les clients.'
    });
  }

  create(): void {
    if (this.form.invalid) return;

    this.loading = true;
    this.success = '';
    this.error = '';

    this.api.createClient(this.form.getRawValue() as any).subscribe({
      next: (client: ClientDto) => {
        this.clients = [client, ...this.clients];
        this.form.reset();
        this.success = 'Client créé avec succès.';
        this.loading = false;
      },
      error: (err: any) => {
        this.error = err?.error?.message || 'Erreur pendant la création du client.';
        this.loading = false;
      }
    });
  }
}