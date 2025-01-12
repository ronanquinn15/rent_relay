import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { WebService } from '../WebService/web.service';
import { CommonModule } from '@angular/common';

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

  constructor(private webService: WebService, private route: ActivatedRoute, private router: Router) { }

  ngOnInit(): void {
    const requestId = this.route.snapshot.paramMap.get('id');
    if (requestId) {
      this.webService.getOneMaintenanceRequest(requestId).subscribe((data) => {
        this.maintenanceRequest = data;
      });
    }
  }

  navigateToEdit(): void {
    if (this.maintenanceRequest && this.maintenanceRequest._id) {
      this.router.navigate([`/maintenance/${this.maintenanceRequest._id}/edit`]);
    }
  }

}
