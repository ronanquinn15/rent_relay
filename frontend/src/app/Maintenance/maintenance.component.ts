import { Component } from '@angular/core';
import { WebService } from '../WebService/web.service';
import { RouterModule, RouterOutlet } from '@angular/router';
import {AsyncPipe, CommonModule} from '@angular/common';

@Component({
  selector: 'maintenance',
  templateUrl: './maintenance.component.html',
  styleUrls: ['./maintenance.component.css'],
  standalone: true,
  imports: [RouterOutlet, RouterModule, AsyncPipe, CommonModule],
  providers: [WebService]
})

export class MaintenanceComponent {
  maintenanceRequests: any = [];

  constructor(private webService: WebService) { }

  ngOnInit() {
    this.webService.getMaintenanceRequests().subscribe((resp) => {
        this.maintenanceRequests = resp;
    });
  }

  trackById(index: number, request: any): string {
    return request._id;
  }
}
