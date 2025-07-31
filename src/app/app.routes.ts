import { Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { AdminDashboardComponent } from './admin-dashboard/admin-dashboard.component';
import { AgentDashboardComponent } from './agent-dashboard/agent-dashboard.component';

export const routes: Routes = [
    {path: 'login', component: LoginComponent},
    {path: 'admin-dashboard', component: AdminDashboardComponent},
    {path: 'agent-dashboard', component: AgentDashboardComponent},
    {
      path: 'mes-taches',
      loadComponent: () => import('./mes-taches.component').then(m => m.MesTachesComponent)
    },
    {path: '', redirectTo: 'login', pathMatch:'full'}
];
