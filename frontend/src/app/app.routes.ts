import { Routes } from '@angular/router';
import { HomeComponent } from './Home/home.component';
import { UserAuthComponent } from './UserAuthentication/userAuth.component';
import { MaintenanceComponent } from './Maintenance/maintenance.component';
import { PropertyComponent } from './Properties/property.component';

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
    path: 'properties-tenants',
    component: PropertyComponent
  },
  {
    path: 'maintenance',
    component: MaintenanceComponent
  }
];
