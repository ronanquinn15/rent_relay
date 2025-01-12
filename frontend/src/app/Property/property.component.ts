import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { WebService } from '../WebService/web.service';

@Component({
  selector: 'app-property',
  templateUrl: './property.component.html',
  styleUrls: ['./property.component.css'],
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  providers: [WebService],
  standalone: true
})
export class PropertyComponent implements OnInit {
  property: any;

  constructor(private webService: WebService, private route: ActivatedRoute) { }

  ngOnInit() {
    const propertyId = this.route.snapshot.paramMap.get('id');
    if (propertyId) {
      this.webService.getOneProperty(propertyId).subscribe((response) => {
        this.property = response;
      });
    } else {
      console.error('Property ID not found in route parameters');
    }
  }
}
