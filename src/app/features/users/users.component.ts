import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { AdminUser, ApiService } from '../../core/api.service';

@Component({
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <section class="page-top">
      <div><h1>Utilisateurs</h1><p>Admin : gestion complète des comptes.</p></div>
      <button class="btn-primary-pro action-lg" (click)="openCreate()">Nouvel utilisateur</button>
    </section>
    <div class="cards-grid">
      <div class="entity-card" *ngFor="let user of users">
        <div class="entity-head">
          <div><strong>{{ user.username }}</strong><p class="entity-subtitle">{{ user.role }}</p></div>
          <span class="badge" [class.red]="!user.active">{{ user.active ? 'Actif' : 'Inactif' }}</span>
        </div>
        <div class="action-grid">
          <button class="action-btn" (click)="openEdit(user)">✏️ Modifier</button>
          <button class="action-btn subtle" (click)="remove(user.id!)">🗑️ Supprimer</button>
        </div>
      </div>
    </div>
    <div class="modal-backdrop" *ngIf="showModal">
      <div class="modal-card">
        <div class="modal-head"><h3>{{ editingId ? 'Modifier utilisateur' : 'Nouvel utilisateur' }}</h3><button class="icon-btn" (click)="close()">×</button></div>
        <form [formGroup]="form" (ngSubmit)="submit()">
          <div class="form-grid">
            <input formControlName="username" placeholder="Nom d'utilisateur">
            <input type="password" formControlName="password" placeholder="Mot de passe">
            <select formControlName="role"><option value="ROLE_ADMIN">Admin</option><option value="ROLE_STAFF">Staff</option></select>
            <select formControlName="active"><option [ngValue]="true">Actif</option><option [ngValue]="false">Inactif</option></select>
          </div>
          <div class="modal-actions"><button type="button" class="btn-secondary-pro" (click)="close()">Annuler</button><button type="submit" class="btn-primary-pro">Enregistrer</button></div>
        </form>
      </div>
    </div>
  `
})
export class UsersComponent implements OnInit {
  private api = inject(ApiService);
  private fb = inject(FormBuilder);
  users: AdminUser[] = [];
  showModal = false;
  editingId?: number;
  form = this.fb.nonNullable.group({ username: '', password: '', role: 'ROLE_STAFF', active: true });
  ngOnInit(): void { this.load(); }
  load(): void { this.api.getUsers().subscribe(v => this.users = v); }
  openCreate(): void { this.editingId = undefined; this.form.reset({ username:'', password:'', role:'ROLE_STAFF', active:true }); this.showModal = true; }
  openEdit(user: AdminUser): void { this.editingId = user.id; this.form.reset({ username:user.username, password:'', role:user.role, active:user.active }); this.showModal = true; }
  close(): void { this.showModal = false; this.editingId = undefined; }
  submit(): void { const p = this.form.getRawValue(); (this.editingId ? this.api.updateUser(this.editingId, p) : this.api.createUser(p)).subscribe(() => { this.close(); this.load(); }); }
  remove(id: number): void { this.api.deleteUser(id).subscribe(() => this.load()); }
}
