import { Component } from '@angular/core';
import { WebService } from '../Services/web.service';
import { AuthService } from '../Services/authService.service';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

// This component is responsible for adding a maintenance request
// It uses Angular's Reactive Forms to manage the form state and validation

@Component({
  selector: 'addMaintenanceForm',
  templateUrl: './addMaintenanceForm.component.html',
  styleUrls: ['./addMaintenanceForm.component.css'],
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  providers: [WebService]
})
export class AddMaintenanceFormComponent {
  maintenanceForm: FormGroup;

  constructor(private webService: WebService,
              private authService: AuthService,
              private router: Router,
              private fb: FormBuilder) {
    this.maintenanceForm = this.fb.group({
      urgency: ['', Validators.required],
      description: ['', Validators.required]
    });
  }

  // This method is used to set the urgency level of the maintenance request
  setUrgency(value: string) {
    this.maintenanceForm.get('urgency')?.setValue(value);
  }

  onSubmit() {
    if (this.maintenanceForm.valid) {
      this.webService.addMaintenanceRequest(this.maintenanceForm.value).subscribe(response => {
        console.log('Maintenance request added successfully', response);
        this.router.navigate(['/maintenance']);
      }, error => {
        console.error('Error adding maintenance request', error);
      });
    }
  }
}
