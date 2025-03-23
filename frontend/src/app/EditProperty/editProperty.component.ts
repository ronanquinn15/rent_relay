import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { WebService } from '../Services/web.service';

@Component({
  selector: 'edit-property',
  templateUrl: './editProperty.component.html',
  styleUrls: ['./editProperty.component.css'],
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  providers: [WebService],
  standalone: true
})
export class EditPropertyComponent implements OnInit {
  property: any = {};
  errorMessage: string = '';

  constructor(private webService: WebService, private route: ActivatedRoute, private router: Router) { }

  ngOnInit() {
    const propertyId = this.route.snapshot.paramMap.get('id');
    if (propertyId) {
      this.webService.getOneProperty(propertyId).subscribe((response) => {
        this.property = response;
        if (this.property.purchase_date) {
          const [year, month, day] = this.property.purchase_date.split('/');
          this.property.purchase_date = `${year}-${month}-${day}`;
        }
      });
    } else {
      console.error('Property ID not found in route parameters');
    }
  }

  onSubmit() {
    const propertyId = this.route.snapshot.paramMap.get('id');
    if (propertyId) {
      if (this.property.purchase_date) {
        const [year, month, day] = this.property.purchase_date.split('-');
        this.property.purchase_date = `${year}/${month}/${day}`;
      }
      this.webService.updateProperty(propertyId, this.property).subscribe((response) => {
        console.log("Property Updated Successfully", response);
        this.router.navigate(['landlords/properties/' + propertyId]);
      }, (error) => {
        console.error("Error updating property details", error);
        this.errorMessage = 'Failed to update property details. Please try again.';
      });
    } else {
      console.error('Property ID not found in route parameters');
      this.errorMessage = 'Property ID not found. Please try again.';
    }
  }
}
