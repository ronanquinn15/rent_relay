import { Component } from '@angular/core';
import { AgGridAngular } from 'ag-grid-angular';
import { ColDef } from 'ag-grid-community';
import { WebService } from '../WebService/web.service';
import { AgCharts } from 'ag-charts-angular';
import { AgChartOptions } from 'ag-charts-community';
import { FormsModule } from '@angular/forms';


@Component({
  selector: 'home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
  standalone: true,
  imports: [AgGridAngular, AgCharts, FormsModule]
})

export class HomeComponent {

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

  data: any = [];

  gridOptions = {
    columnDefs: this.headings,
    rowData: this.data,
    defaultColDef: {
      flex: 1,
      minWidth: 100,
    },
    domLayout: 'autoHeight' as 'autoHeight',
  };

  constructor(private webService: WebService) { }

  ngOnInit() {
    this.webService.getProperties().subscribe((resp) => {
        this.data = resp;
    });
  }


}
