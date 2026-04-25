import { Routes } from '@angular/router';
import { DashboardComponent } from './features/dashboard/dashboard.component';
import { TraceabilityComponent } from './features/traceability/traceability.component';
import { FridgesComponent } from './features/fridges/fridges.component';
import { CleaningZonesComponent } from './features/cleaning-zones/cleaning-zones.component';
import { UsersComponent } from './features/users/users.component';
import { HygieneReportComponent } from './features/hygiene-report/hygiene-report.component';
import { HistoryComponent } from './features/history/history.component';
import { LoginComponent } from './features/login/login.component';
import { authGuard } from './core/auth.guard';
import { loginGuard } from './core/login.guard';
import { rootRedirectGuard } from './core/root-redirect.guard';

export const routes: Routes = [
  { path: '', canActivate: [rootRedirectGuard], component: LoginComponent },
  { path: 'login', component: LoginComponent, canActivate: [loginGuard] },
  { path: 'dashboard', component: DashboardComponent, canActivate: [authGuard] },
  { path: 'traceability', component: TraceabilityComponent, canActivate: [authGuard] },
  { path: 'fridges', component: FridgesComponent, canActivate: [authGuard] },
  { path: 'cleaning-zones', component: CleaningZonesComponent, canActivate: [authGuard] },
  { path: 'history', component: HistoryComponent, canActivate: [authGuard] },
  { path: 'users', component: UsersComponent, canActivate: [authGuard] },
  { path: 'hygiene-report', component: HygieneReportComponent, canActivate: [authGuard] },
  { path: '**', canActivate: [rootRedirectGuard], component: LoginComponent }
];
