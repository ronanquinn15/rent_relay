import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { WebService } from '../WebService/web.service';

@Component({
  selector: 'app-property',
  templateUrl: './property.component.html',
  styleUrls: ['./property.component.css'],
  imports: [CommonModule, ReactiveFormsModule],
  providers: [WebService],
  standalone: true
})
export class PropertyComponent implements OnInit {
  property: any = {};

  constructor(private webService: WebService, private route: ActivatedRoute, private router: Router) { }

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

  navigateToEdit() {
    const propertyId = this.route.snapshot.paramMap.get('id');
    if (propertyId) {
      this.router.navigate([`/landlords/properties/${propertyId}/edit`]);
    } else {
      console.error('Property ID not found in route parameters');
    }
  }

  deleteProperty() {
    const propertyId = this.route.snapshot.paramMap.get('id');
    if (propertyId) {
      this.webService.deleteProperty(propertyId).subscribe(() => {
        console.log("Property Deleted Successfully");
        this.router.navigate(['/landlords/properties']);
      }, (error) => {
        console.error("Error deleting property", error);
      });
    } else {
      console.error('Property ID not found in route parameters');
    }
  }

}
