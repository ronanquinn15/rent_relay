import { Component, OnInit } from '@angular/core';
import { AgGridAngular } from 'ag-grid-angular';
import { ColDef } from 'ag-grid-community';
import { WebService } from '../WebService/web.service';
import { AgCharts } from 'ag-charts-angular';
import { AgChartOptions } from 'ag-charts-community';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../AuthenticationService/authService.component';
import { NgIf } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
  standalone: true,
  imports: [AgGridAngular, AgCharts, FormsModule, NgIf]
})
export class HomeComponent implements OnInit {
  userRole: string = '';
  data: any[] = [];
  tenantProperty: any = {};
  tenantInfo: any = {};

  headings: ColDef[] = [
    { field: "address" },
    { field: "city" },
    { field: "postcode" },
    { field: "number_of_bathrooms", headerName: "Number of Bathrooms" },
    { field: "number_of_bedrooms", headerName: "Number of Bedrooms" },
    { field: "number_of_tenants", headerName: "Number of Tenants" },
    { field: "purchase_date", headerName: "Purchase Date" },
    { field: "rent" },
  ];

  gridOptions = {
    columnDefs: this.headings,
    rowData: this.data,
    defaultColDef: {
      flex: 1,
      minWidth: 100,
    },
    domLayout: 'autoHeight' as 'autoHeight',
  };

  constructor(private webService: WebService, private authService: AuthService, private router: Router) { }

  loadTenantInfo(): void {
    this.webService.getTenantInfo().subscribe((resp) => {
      this.tenantInfo = resp;
    });
  }

  ngOnInit() {
    this.userRole = this.authService.getUserRole();
    if (this.userRole === 'landlord') {
      this.loadProperties();
    } else if (this.userRole === 'tenant') {
      this.loadTenantProperty();
      this.loadTenantInfo();
    }
  }

  loadProperties(): void {
    this.webService.getProperties().subscribe((resp) => {
      this.data = resp;
    });
  }

  loadTenantProperty(): void {
    this.webService.getPropertyRelatedToTenant().subscribe((resp) => {
      this.tenantProperty = resp;
    });
  }

  editTenant(): void {
    this.router.navigate(['tenant-details/edit']);
  }

}
