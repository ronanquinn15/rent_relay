import { Component } from '@angular/core';
import { WebService } from '../WebService/web.service';
import { RouterModule, RouterOutlet } from '@angular/router';
import { AsyncPipe } from '@angular/common';

@Component({
  selector: 'app-property',
  templateUrl: './property.component.html',
  styleUrls: ['./property.component.css'],
  imports: [RouterOutlet, RouterModule, AsyncPipe],
  providers: [WebService],
  standalone: true
})

export class PropertyComponent {
  properties: any = [];

  constructor(private webService: WebService) { }

  ngOnInit() {
    this.webService.getPropertyWithTenants().subscribe((resp) => {
        this.properties = resp;
    });
  }

}
