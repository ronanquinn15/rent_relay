import { Component, OnInit } from '@angular/core';
import { WebService } from '../Services/web.service';
import { RouterModule, RouterOutlet } from '@angular/router';
import { AsyncPipe, CommonModule } from '@angular/common';
import { AuthService } from '../Services/authService.service';

@Component({
  selector: 'maintenance',
  templateUrl: './maintenance.component.html',
  styleUrls: ['./maintenance.component.css'],
  standalone: true,
  imports: [RouterOutlet, RouterModule, AsyncPipe, CommonModule],
  providers: [WebService]
})

export class MaintenanceComponent implements OnInit {
  maintenanceRequests: any = [];
  userRole: string = '';

  constructor(private webService: WebService, private authService: AuthService) { }

  ngOnInit() {
    this.userRole = this.authService.getUserRole();
    if (this.userRole === 'landlord') {
      this.webService.getMaintenanceRequests().subscribe((resp) => {
        this.maintenanceRequests = resp;
      });
    } else if (this.userRole === 'tenant') {
      this.webService.getMaintenanceRequestsRelatedToTenant().subscribe((resp) => {
        this.maintenanceRequests = resp;
      });
    }
  }

  trackById(index: number, request: any): string {
    return request._id;
  }

  getStatus(status: boolean): string {
    return status ? 'Complete' : 'Pending';
  }
}
