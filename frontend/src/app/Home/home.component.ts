import { Component, OnInit } from '@angular/core';
import { AgGridAngular } from 'ag-grid-angular';
import { ColDef } from 'ag-grid-community';
import { WebService } from '../Services/web.service';
import { AgCharts } from 'ag-charts-angular';
import { AgChartOptions } from 'ag-charts-community';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../Services/authService.service';
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
  landlordInfo: any = {};
  isLoggedIn: boolean = false;
  cityDistributionChartOptions: AgChartOptions = {};

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

  // Initialize pie chart for property distribution by city
  initCityDistributionChart(): void {
    // Group properties by city and count them
  const cityDistribution = this.data.reduce((acc, property) => {
    if (!acc[property.city]) {
      acc[property.city] = 0;
    }
    acc[property.city]++;
    return acc;
  }, {});

  // Transform data for the pie chart
  const cityChartData = Object.keys(cityDistribution).map(city => ({
    city: city,
    count: cityDistribution[city]
  }));

  this.cityDistributionChartOptions = {
    title: {
      text: 'Properties by City',
      fontSize: 18,
      fontWeight: 'bold',
    },
    data: cityChartData,
    series: [{
      type: 'pie',
      angleKey: 'count',
      calloutLabelKey: 'city',
      sectorLabelKey: 'count',
      fills: ['#7CB5EC', '#90ED7D', '#F7A35C', '#8085E9', '#F15C80'],
    }],
  };
}

  constructor(private webService: WebService, private authService: AuthService, private router: Router) { }

  loadTenantInfo(): void {
    this.webService.getTenantInfo().subscribe((resp) => {
      this.tenantInfo = resp;
    });
  }

  loadLandlordInfo(): void {
    this.webService.getLandlordInfo().subscribe((resp) => {
      this.landlordInfo = resp;
    });
  }

  ngOnInit() {
    this.isLoggedIn = this.authService.isLoggedIn(); // Add this line
    this.userRole = this.authService.getUserRole();
    if (this.userRole === 'landlord') {
      this.loadLandlordInfo();
      this.loadProperties();
    } else if (this.userRole === 'tenant') {
      this.loadTenantInfo();
      this.loadTenantProperty();
    }
  }

  loadProperties(): void {
    this.webService.getProperties().subscribe((resp) => {
      this.data = resp;
      this.initCityDistributionChart();
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

  editLandlord(): void {
    this.router.navigate(['landlord-details/edit']);
  }

}
