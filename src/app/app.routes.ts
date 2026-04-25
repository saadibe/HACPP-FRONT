import { Routes } from '@angular/router';
import { LoginComponent } from './features/login/login.component';
import { DashboardComponent } from './features/dashboard/dashboard.component';
import { FridgesComponent } from './features/fridges/fridges.component';
import { CleaningZonesComponent } from './features/cleaning-zones/cleaning-zones.component';
import { TraceabilityComponent } from './features/traceability/traceability.component';
import { BatchesComponent } from './features/batches/batches.component';
import { PrintBatchComponent } from './features/print-batch/print-batch.component';
import { CleaningAlertsComponent } from './features/alerts/cleaning-alerts.component';
import { FridgeAlertsComponent } from './features/alerts/fridge-alerts.component';
import { LayoutComponent } from './layout/layout.component';
import { HygieneReportComponent } from './features/hygiene-report/hygiene-report.component';
import { UsersComponent } from './features/users/users.component';
import { authGuard } from './core/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  {
    path: '',
    component: LayoutComponent,
    canActivate: [authGuard],
    children: [
      { path: 'dashboard', component: DashboardComponent },
      { path: 'fridges', component: FridgesComponent },
      { path: 'cleaning-zones', component: CleaningZonesComponent },
      { path: 'traceability', component: TraceabilityComponent },
      { path: 'batches', component: BatchesComponent },
      { path: 'batches/print/:id', component: PrintBatchComponent },
      { path: 'users', component: UsersComponent },
      { path: 'hygiene-report', component: HygieneReportComponent }
    ]
  },
  { path: '**', redirectTo: 'login' }
];
