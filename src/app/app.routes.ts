import { Routes } from '@angular/router';
import { LoginComponent } from './features/login/login.component';
import { LayoutComponent } from './layout/layout.component';
import { DashboardComponent } from './features/dashboard/dashboard.component';
import { FridgesComponent } from './features/fridges/fridges.component';
import { CleaningZonesComponent } from './features/cleaning-zones/cleaning-zones.component';
import { TraceabilityComponent } from './features/traceability/traceability.component';
import { HistoryComponent } from './features/history/history.component';
import { UsersComponent } from './features/users/users.component';
import { HygieneReportComponent } from './features/hygiene-report/hygiene-report.component';
import { ClientsComponent } from './features/clients/clients.component';
import { authGuard } from './core/auth.guard';
import { loginGuard } from './core/login.guard';
import { rootRedirectGuard } from './core/root-redirect.guard';
import { superAdminGuard } from './core/super-admin.guard';
import {ShellyAdminComponent} from './features/shelly-admin/shelly-admin.component'
import {TemperatureDashboardComponent} from './features/temperature-dashboard/temperature-dashboard.component'
export const routes: Routes = [
  { path: '', canActivate: [rootRedirectGuard], component: LoginComponent },

  { path: 'login', component: LoginComponent, canActivate: [loginGuard] },

  {
    path: '',
    component: LayoutComponent,
    canActivate: [authGuard],
    children: [
      { path: 'dashboard', component: DashboardComponent },
      { path: 'fridges', component: FridgesComponent },
      { path: 'cleaning-zones', component: CleaningZonesComponent },
      { path: 'traceability', component: TraceabilityComponent },
      { path: 'history', component: HistoryComponent },
      { path: 'users', component: UsersComponent },
      { path: 'hygiene-report', component: HygieneReportComponent },
      { path: 'clients', component: ClientsComponent,canActivate: [authGuard, superAdminGuard] },
      {
        path: 'shelly-admin',
        component: ShellyAdminComponent
      },
{
  path: 'temperature-dashboard/:id',
  loadComponent: () =>
    import('./features/temperature-dashboard/temperature-dashboard.component')
      .then(m => m.TemperatureDashboardComponent)
}
    ]
  },

  { path: '**', redirectTo: '' }
];