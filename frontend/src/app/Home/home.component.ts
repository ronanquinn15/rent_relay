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

// This component is responsible for displaying the home page
// It shows the properties owned by the landlord or the tenant's property
// It also displays charts for property distribution by city and average rent by city
// The data is fetched from the web service and displayed in a grid format
// The charts are created using the ag-charts library
// The component uses Angular's dependency injection to get the web service and authentication service
// It also uses Angular's router to navigate to different pages
// The component implements OnInit to perform initialisation tasks

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
  cityRentDistributionChartOptions: AgChartOptions = {};

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

  // Initialise pie chart for property distribution by city
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

  initCityRentDistributionChart(): void {
  // Create an object to store both the sum of rent and count of properties by city
  const cityData = this.data.reduce((acc, property) => {
    // Check if the city already exists in the accumulator
    if (!acc[property.city]) {
      acc[property.city] = {
        totalRent: 0,
        propertyCount: 0
      };
    }
    // Ensure rent is a number
    const rentValue = typeof property.rent === 'string' ? parseFloat(property.rent) : property.rent;
    acc[property.city].totalRent += rentValue;
    acc[property.city].propertyCount++;
    return acc;
  }, {});

  // Calculate the average rent for each city
  const cityChartData = Object.keys(cityData).map(city => ({
    city: city,
    avgRent: Math.round(cityData[city].totalRent / cityData[city].propertyCount),
    // Add a formatted version for display
    label: `£${Math.round(cityData[city].totalRent / cityData[city].propertyCount).toLocaleString()}`
  }));

  this.cityRentDistributionChartOptions = {
    title: {
      text: 'Average Rent by City',
      fontSize: 18,
      fontWeight: 'bold',
    },
    data: cityChartData,
    series: [{
      type: 'pie',
      angleKey: 'avgRent',
      calloutLabelKey: 'city',
      sectorLabelKey: 'label',
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

  // This method is called when the component is initialised
  // It checks the user's role and loads the relevant information
  // It also loads the properties for landlords or tenant's property
  ngOnInit() {
    this.isLoggedIn = this.authService.isLoggedIn();
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
      this.initCityRentDistributionChart();
    });
  }

  loadTenantProperty(): void {
    this.webService.getPropertyRelatedToTenant().subscribe((resp) => {
      this.tenantProperty = resp;
    });
  }

  // The following methods are used to navigate to different pages for editing user information for
  // each role respectively
  editTenant(): void {
    this.router.navigate(['tenant-details/edit']);
  }

  editLandlord(): void {
    this.router.navigate(['landlord-details/edit']);
  }

}
