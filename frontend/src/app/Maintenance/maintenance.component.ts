import { Component, OnInit } from '@angular/core';
import { WebService } from '../Services/web.service';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../Services/authService.service';

@Component({
  selector: 'maintenance',
  templateUrl: './maintenance.component.html',
  styleUrls: ['./maintenance.component.css'],
  standalone: true,
  imports: [RouterModule, CommonModule],
  providers: [WebService]
})

export class MaintenanceComponent implements OnInit {
  maintenanceRequests: any = [];
  filteredRequests: any = [];
  userRole: string = '';
  filterStatus: string = 'all';

  // Pagination properties
  currentPage: number = 1;
  itemsPerPage: number = 5;
  totalItems: number = 0;

  constructor(private webService: WebService, private authService: AuthService) { }

  ngOnInit() {
    this.userRole = this.authService.getUserRole();
    if (this.userRole === 'landlord') {
      this.webService.getMaintenanceRequests().subscribe((resp) => {
        this.maintenanceRequests = resp;
        this.filteredRequests = resp;
        this.totalItems = resp.length;
      });
    } else if (this.userRole === 'tenant') {
      this.webService.getMaintenanceRequestsRelatedToTenant().subscribe((resp) => {
        this.maintenanceRequests = resp;
        this.filteredRequests = resp;
        this.totalItems = resp.length;
      });
    }
  }

  filterRequests(status: string) {
    this.filterStatus = status;
    if (status === 'all') {
      this.filteredRequests = this.maintenanceRequests;
    } else {
      const isCompleted = status === 'completed';
      this.filteredRequests = this.maintenanceRequests.filter((request: any) => request.status === isCompleted);
    }
    this.totalItems = this.filteredRequests.length;
    this.currentPage = 1; // Reset to first page
  }

  trackById(index: number, request: any): string {
    return request._id;
  }

  getStatus(status: boolean): string {
    return status ? 'Complete' : 'Pending';
  }

  // Pagination methods
  get paginatedRequests() {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    return this.filteredRequests.slice(startIndex, startIndex + this.itemsPerPage);
  }

  changePage(page: number) {
    this.currentPage = page;
  }

  protected readonly Math = Math;
}
