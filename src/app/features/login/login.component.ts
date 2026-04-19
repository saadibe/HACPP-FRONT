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

        <form [formGroup]="form" (ngSubmit)="submit()" class="login-form-pro">
          <label>
            <span>Nom d'utilisateur</span>
            <input formControlName="username" placeholder="admin">
          </label>

          <label>
            <span>Mot de passe</span>
            <input formControlName="password" type="password" placeholder="••••••••">
          </label>

          <button type="submit" class="btn-primary-pro">Se connecter</button>
        </form>

        <p *ngIf="error" class="error-text">{{ error }}</p>
      </div>
    </div>
  `
})
export class LoginComponent implements OnInit {
  private fb = inject(FormBuilder);
  private api = inject(ApiService);
  private router = inject(Router);

  error = '';

  form = this.fb.nonNullable.group({
    username: '',
    password: ''
  });

  ngOnInit(): void {
    if (localStorage.getItem('token')) {
      this.router.navigateByUrl('/dashboard');
    }
  }

  submit(): void {
    this.error = '';

    this.api.login(this.form.getRawValue()).subscribe({
      next: (res) => {
        localStorage.setItem('token', res.token);
        localStorage.setItem('username', res.username);
        localStorage.setItem('role', res.role);
        localStorage.setItem('restaurantId', String(res.restaurantId));
        this.router.navigateByUrl('/dashboard');
      },
      error: () => {
        this.error = 'Connexion impossible';
      }
    });
  }
}
