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
      <div class="login-card">
        <div class="login-head">
          <div class="logo-circle">LP</div>
          <div>
            <h1>Connexion</h1>
            <p>Accède à ton espace HACCP</p>
          </div>
        </div>

        <div class="demo-box">
          <strong>Compte démo</strong>
          <span>admin / admin123</span>
        </div>

        <form [formGroup]="form" (ngSubmit)="submit()">
          <label>Nom d'utilisateur</label>
          <input formControlName="username" placeholder="Nom d'utilisateur">

          <label>Mot de passe</label>
          <input formControlName="password" type="password" placeholder="Mot de passe">

          <button type="submit">Se connecter</button>
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
    username: 'admin',
    password: 'admin123'
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
        this.router.navigateByUrl('/dashboard');
      },
      error: () => this.error = 'Connexion impossible'
    });
  }
}
