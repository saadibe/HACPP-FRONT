import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ApiService } from '../../core/api.service';

@Component({
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="login-shell">
      <div class="login-visual">
        <div class="login-badge">HACCP</div>
        <h1>Gestion qualité restaurant</h1>
        <p>Traçabilité, nettoyage, relevés frigo, alertes et DLC dans une interface optimisée pour la tablette.</p>

        <div class="feature-list">
          <div class="feature-item">✓ Relevés photo rapides</div>
          <div class="feature-item">✓ Traçabilité centralisée</div>
          <div class="feature-item">✓ Alertes automatiques</div>
        </div>
      </div>

      <div class="login-card">
        <div class="login-head">
          <div class="logo-circle">LP</div>
          <div>
            <h2>Connexion</h2>
            <p>Accès sécurisé à l'application</p>
          </div>
        </div>

        <form [formGroup]="form" (ngSubmit)="login()">
          <label>Nom d'utilisateur</label>
          <input formControlName="username" autocomplete="username" placeholder="admin">

          <label>Mot de passe</label>
          <input type="password" formControlName="password" autocomplete="current-password" placeholder="••••••••">

          <button type="submit" [disabled]="loading">
            {{ loading ? 'Connexion...' : 'Se connecter' }}
          </button>

          <p class="error" *ngIf="error">{{ error }}</p>
        </form>
      </div>
    </div>
  `
})
export class LoginComponent implements OnInit {
  private fb = inject(FormBuilder);
  private api = inject(ApiService);
  private router = inject(Router);

  loading = false;
  error = '';

  form = this.fb.nonNullable.group({
    username: 'admin',
    password: ''
  });

  ngOnInit(): void {
    if (localStorage.getItem('token')) {
      this.router.navigate(['/dashboard']);
    }
  }

  login(): void {
    this.loading = true;
    this.error = '';

    this.api.login(this.form.getRawValue()).subscribe({
      next: (res: any) => {
        localStorage.setItem('token', res.token);
        localStorage.setItem('username', res.username || this.form.getRawValue().username);
        localStorage.setItem('role', res.role || '');
        localStorage.setItem('restaurantId', String(res.restaurantId || ''));

        this.loading = false;
        this.router.navigate(['/dashboard']);
      },
      error: () => {
        this.loading = false;
        this.error = 'Connexion impossible';
      }
    });
  }
}