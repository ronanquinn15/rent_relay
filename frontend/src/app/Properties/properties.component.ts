import { Component, OnInit } from '@angular/core';
import { WebService } from '../Services/web.service';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-property',
  templateUrl: './properties.component.html',
  styleUrls: ['./properties.component.css'],
  imports: [RouterModule, CommonModule, FormsModule],
  providers: [WebService],
  standalone: true
})
export class PropertiesComponent implements OnInit {
  properties: any = [];
  filteredProperties: any = [];
  searchTerm: string = '';

  // Pagination properties
  currentPage: number = 1;
  itemsPerPage: number = 5;
  totalItems: number = 0;

  constructor(private webService: WebService) { }

  ngOnInit() {
    this.webService.getPropertyWithTenants().subscribe((resp) => {
      this.properties = resp;
      this.filteredProperties = resp;
      this.totalItems = resp.length;
    });
  }

  trackById(index: number, prop: any): string {
    return prop._id;
  }

  // Pagination methods
  get paginatedProperties() {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    return this.filteredProperties.slice(startIndex, startIndex + this.itemsPerPage);
  }

  changePage(page: number) {
    this.currentPage = page;
  }

  // Search and filter method
  searchProperties() {
    this.filteredProperties = this.properties.filter((prop: any) => {
      return (
        prop.address.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        prop.city.toLowerCase().includes(this.searchTerm.toLowerCase())
      );
    });
    this.totalItems = this.filteredProperties.length;
    this.currentPage = 1; // Reset to first page
  }

  protected readonly Math = Math;
}
