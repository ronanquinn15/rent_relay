import { Component } from '@angular/core';
import { WebService } from '../WebService/web.service';
import { RouterModule, RouterOutlet } from '@angular/router';
import { AsyncPipe, CommonModule } from '@angular/common';

@Component({
  selector: 'app-property',
  templateUrl: './properties.component.html',
  styleUrls: ['./properties.component.css'],
  imports: [RouterOutlet, RouterModule, AsyncPipe, CommonModule],
  providers: [WebService],
  standalone: true
})
export class PropertiesComponent {
  properties: any = [];

  constructor(private webService: WebService) { }

  ngOnInit() {
    this.webService.getPropertyWithTenants().subscribe((resp) => {
        this.properties = resp;
    });
  }

  trackById(index: number, prop: any): string {
    return prop._id;
  }
}
