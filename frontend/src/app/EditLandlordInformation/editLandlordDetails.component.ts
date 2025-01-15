import { Component, OnInit } from '@angular/core';
import { WebService } from '../Services/web.service';
import { ActivatedRoute, Router } from '@angular/router';
import { FormGroup, FormControl, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-edit-landlord-details',
  templateUrl: './editLandlordDetails.component.html',
  styleUrls: ['./editLandlordDetails.component.css'],
  providers: [WebService],
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule]
})
export class EditLandlordDetailsComponent implements OnInit {
  landlordForm: FormGroup;
  landlordId: string = '';

  constructor(private webService: WebService, private route: ActivatedRoute, private router: Router) {
    this.landlordForm = new FormGroup({
      name: new FormControl('', Validators.required),
      username: new FormControl('', Validators.required),
      email: new FormControl('', [Validators.required, Validators.email]),
      password: new FormControl('')
    });
  }

  ngOnInit() {
    this.loadLandlordDetails();
  }

  loadLandlordDetails() {
    this.webService.getLandlordInfo().subscribe((landlord) => {
      this.landlordId = landlord._id;
      this.landlordForm.patchValue({
        name: landlord.name,
        username: landlord.username,
        email: landlord.email
      });
    });
  }

  onSubmit() {
    if (this.landlordForm.valid) {
      this.webService.updateLandlordInfo(this.landlordId, this.landlordForm.value).subscribe(response => {
        console.log('Landlord details updated successfully', response);
        this.router.navigate(['/']);
      }, error => {
        console.error('Error updating landlord details', error);
      });
    }
  }
}
