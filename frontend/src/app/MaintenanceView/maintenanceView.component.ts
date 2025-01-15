import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { WebService } from '../Services/web.service';
import { CommonModule } from '@angular/common';
import { AuthService } from '../Services/authService.service';

@Component({
  selector: 'app-maintenance-view',
  templateUrl: './maintenanceView.component.html',
  styleUrls: ['./maintenanceView.component.css'],
  standalone: true,
  providers: [WebService],
  imports: [CommonModule]
})

export class MaintenanceViewComponent implements OnInit {
  maintenanceRequest: any;
  userRole: string = '';

  constructor(private webService: WebService,
              private route: ActivatedRoute,
              private router: Router,
              private authService: AuthService) { }

  ngOnInit(): void {
    this.userRole = this.authService.getUserRole();
    const requestId = this.route.snapshot.paramMap.get('id');
    if (requestId) {
      if (this.userRole === 'landlord') {
        this.webService.getOneMaintenanceRequest(requestId).subscribe((data) => {
          this.maintenanceRequest = data;
        });
      } else if (this.userRole === 'tenant') {
        this.webService.getOneMaintenanceRequestRelatedToTenant(requestId).subscribe((data) => {
          this.maintenanceRequest = data;
        });
      }
    }
  }

  navigateToEdit(): void {
    if (this.maintenanceRequest && this.maintenanceRequest._id) {
      this.router.navigate([`/maintenance/${this.maintenanceRequest._id}/edit`]);
    }
  }

  deleteMaintenanceRequest(): void {
    const requestId = this.route.snapshot.paramMap.get('id');
    if (requestId) {
      this.webService.deleteMaintenanceRequest(requestId).subscribe(() => {
        console.log('Maintenance Request Deleted Successfully');
        this.router.navigate(['/maintenance']);
      }, (error) => {
        console.error('Error deleting maintenance request', error);
      });
    } else {
      console.error('Maintenance Request ID not found in route parameters');
    }
  }

  trackById(index: number, request: any): string {
    return request._id;
  }

  getStatus(status: boolean): string {
    return status ? 'Complete' : 'Pending';
  }

}
