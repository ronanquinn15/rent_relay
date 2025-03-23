import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { WebService } from '../Services/web.service';
import {CommonModule} from '@angular/common';

@Component({
  selector: 'app-add-property',
  templateUrl: './addProperty.component.html',
  styleUrls: ['./addProperty.component.css'],
  standalone: true,
  imports: [
    ReactiveFormsModule, CommonModule
  ],
  providers: [WebService]
})
export class AddPropertyComponent {
  addPropertyForm: FormGroup;
  errorMessage: string = '';

  constructor(
    private fb: FormBuilder,
    private webService: WebService,
    private router: Router
  ) {
    this.addPropertyForm = this.fb.group({
      address: ['', Validators.required],
      city: ['', Validators.required],
      postcode: ['', Validators.required],
      number_of_bedrooms: ['', Validators.required],
      number_of_bathrooms: ['', Validators.required],
      rent: ['', Validators.required],
      purchase_date: ['', Validators.required],
      tenant_id: ['', Validators.required]
    });
  }

  onSubmit() {
    if (this.addPropertyForm.valid) {
      this.webService.addProperty(this.addPropertyForm.value).subscribe(() => {
        this.router.navigate(['/landlords/properties']);
      }, (error) => {
        console.error('Error adding property', error);
        this.errorMessage = 'Failed to add property. Please try again.'; // Set error message
      });
    } else {
      console.error('Form is invalid', this.addPropertyForm);
      this.errorMessage = 'Please fill out all required fields.'; // Set error message
    }
  }
}
