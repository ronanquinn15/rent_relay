import { Routes } from '@angular/router';
import { HomeComponent } from './Home/home.component';
import { UserAuthComponent } from './UserAuthentication/userAuth.component';
import { MaintenanceComponent } from './Maintenance/maintenance.component';

export const routes: Routes = [
  {
    path: '',
    component: HomeComponent
  },
  {
    path: 'login',
    component: UserAuthComponent,
  },
  {
    path: 'maintenance',
    component: MaintenanceComponent
  }
];
