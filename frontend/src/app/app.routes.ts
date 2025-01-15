import { Routes } from '@angular/router';
import { HomeComponent } from './Home/home.component';
import { UserAuthComponent } from './UserAuthentication/userAuth.component';
import { MaintenanceComponent } from './Maintenance/maintenance.component';
import { PropertiesComponent } from './Properties/properties.component';
import { PropertyComponent } from './Property/property.component';
import { EditPropertyComponent } from './EditProperty/editProperty.component';
import { AddPropertyComponent } from './AddProperty/addProperty.component';
import { MaintenanceViewComponent } from './MaintenanceView/maintenanceView.component';
import { EditMaintenanceComponent } from './EditMaintenance/editMaintenance.component';
import { AddMaintenanceFormComponent } from './AddMaintenanceForm/addMaintenanceForm.component';
import { EditTenantDetailsComponent } from './EditTenantInformation/editTenantDetails.component';

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
    path: 'tenant-details/edit',
    component: EditTenantDetailsComponent
  },
  {
    path: 'landlords/properties',
    component: PropertiesComponent
  },
  {
    path: 'landlords/properties/add',
    component: AddPropertyComponent
  },
  {
    path: 'landlords/properties/:id',
    component: PropertyComponent
  },
  {
    path: 'landlords/properties/:id/edit',
    component: EditPropertyComponent
  },
  {
    path: 'maintenance',
    component: MaintenanceComponent
  },
  {
    path: 'maintenance/add',
    component: AddMaintenanceFormComponent
  },
  {
    path: 'maintenance/:id',
    component: MaintenanceViewComponent
  },
  {
    path: 'maintenance/:id/edit',
    component: EditMaintenanceComponent
  }
];
