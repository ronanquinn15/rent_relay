import { Component } from '@angular/core';
import { WebService } from '../WebService/web.service';
import { RouterModule, RouterOutlet } from '@angular/router';
import { AsyncPipe } from '@angular/common';

@Component({
  selector: 'maintenance',
  templateUrl: './maintenance.component.html',
  styleUrls: ['./maintenance.component.css'],
  standalone: true,
  imports: [RouterOutlet, RouterModule, AsyncPipe],
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

}
